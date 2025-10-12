/**
 * Optional local test script for pinging multiple Supabase databases
 * Usage: node ping-supabase.js
 * 
 * Make sure to create a .env file with SUPABASE_CONFIGS
 * Or set it as an environment variable
 */

(async () => {
  try {
    // Try to load dotenv for local testing (not required)
    try {
      require('dotenv').config();
    } catch (e) {
      // dotenv not installed, using system environment variables
    }

    const { createClient } = require('@supabase/supabase-js');
    
    // Parse database configurations from JSON
    if (!process.env.SUPABASE_CONFIGS) {
      throw new Error('Missing SUPABASE_CONFIGS environment variable');
    }

    const configs = JSON.parse(process.env.SUPABASE_CONFIGS);
    
    if (!Array.isArray(configs) || configs.length === 0) {
      throw new Error('SUPABASE_CONFIGS must be a non-empty array of database configurations');
    }

    console.log('Pinging', configs.length, 'database(s)...');
    console.log('Timestamp:', new Date().toISOString());
    console.log('-'.repeat(60));
    
    let successCount = 0;
    let failCount = 0;

    // Ping each database
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      const dbName = config.name || `Database ${i + 1}`;
      
      try {
        console.log(`\n[${i + 1}/${configs.length}] ${dbName}`);
        console.log('URL:', config.url);
        
        if (!config.url || !config.key) {
          throw new Error(`Missing url or key for ${dbName}`);
        }

        // Create Supabase client
        const supabase = createClient(config.url, config.key);

        // Ping by making an actual network request to verify connectivity
        // We'll use a simple REST API call to check if the server is reachable
        const startTime = Date.now();
        const response = await fetch(`${config.url}/rest/v1/`, {
          headers: {
            'apikey': config.key,
            'Authorization': `Bearer ${config.key}`
          }
        });
        const duration = Date.now() - startTime;

        // Check if we got a response (even an error response means the server is alive)
        if (!response.ok && response.status !== 404 && response.status !== 401) {
          throw new Error(`Server returned status ${response.status}`);
        }
        
        console.log('Success! Response time:', duration + 'ms');
        successCount++;
        
      } catch (err) {
        console.error('Failed:', err.message);
        failCount++;
      }
    }

    // Summary
    console.log('\n' + '-'.repeat(60));
    console.log('Summary:');
    console.log('  Successful:', successCount);
    console.log('  Failed:', failCount);
    console.log('  Total:', configs.length);
    
    if (failCount > 0) {
      console.error('\nSome databases failed to ping');
      process.exit(1);
    }
    
    console.log('\nAll databases pinged successfully!');
    
  } catch (err) {
    console.error('\nFatal error:', err.message);
    console.error('Make sure SUPABASE_CONFIGS is set as a JSON array:');
    console.error('[{"name":"My DB","url":"https://xxx.supabase.co","key":"your-key"}]');
    process.exit(1);
  }
})();

