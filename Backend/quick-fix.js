const bcrypt = require('bcryptjs');
const supabase = require('./db/supabaseClient');

async function quickFix() {
  console.log('🔧 Quick Fix: Creating test user...\n');
  
  try {
    // First, check if password_hash column exists
    const { data: columns, error: schemaError } = await supabase
      .rpc('get_columns', { table_name: 'users' });

    if (schemaError) {
      // Alternative check using information_schema
      console.log('Checking database schema...');
      
      // Test if we can insert a user (this will fail if column doesn't exist)
      const testHash = await bcrypt.hash('password123', 12);
      
      const { data: testUser, error: testError } = await supabase
        .from('users')
        .insert([{
          email: 'test_structure@example.com',
          password_hash: testHash,
          full_name: 'Test User',
          role: 'cashier'
        }])
        .select();

      if (testError) {
        if (testError.message.includes('password_hash')) {
          console.log('❌ The password_hash column is missing from users table!');
          console.log('📝 Please run this SQL in Supabase Dashboard → SQL Editor:');
          console.log('\n' + '='.repeat(60));
          console.log('ALTER TABLE users ADD COLUMN password_hash TEXT;');
          console.log('='.repeat(60) + '\n');
          console.log('After adding the column, run this script again.');
          return;
        } else {
          console.log('Database error:', testError.message);
          return;
        }
      }

      // Clean up test user
      await supabase
        .from('users')
        .delete()
        .eq('email', 'test_structure@example.com');
    }

    // Create the main test user
    const passwordHash = await bcrypt.hash('password123', 12);
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', 'owner@example.com')
      .single();

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password_hash: passwordHash,
          full_name: 'Shop Owner',
          role: 'owner'
        })
        .eq('email', 'owner@example.com');

      if (updateError) {
        console.error('Update error:', updateError);
        return;
      }
      console.log('✅ Updated existing owner@example.com user');
    } else {
      // Create new user
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          email: 'owner@example.com',
          password_hash: passwordHash,
          full_name: 'Shop Owner',
          role: 'owner'
        }]);

      if (insertError) {
        console.error('Insert error:', insertError);
        return;
      }
      console.log('✅ Created new owner@example.com user');
    }

    console.log('\n🎯 Login Credentials Ready:');
    console.log('   Email: owner@example.com');
    console.log('   Password: password123');
    console.log('\n🌐 Frontend: http://localhost:5174');
    console.log('🔧 Backend: http://localhost:3000');
    console.log('\n✅ You can now test login!');

  } catch (error) {
    console.error('❌ Quick fix failed:', error.message);
    console.log('\nIf password_hash column issue persists:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Run: ALTER TABLE users ADD COLUMN password_hash TEXT;');
    console.log('3. Run this script again');
  }
}

quickFix();