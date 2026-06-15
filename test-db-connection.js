const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rwqjplbxyntqylfnwzqq.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'YOUR_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('Testing Supabase database connection...\n')

  try {
    // Test 1: Check if categories table exists
    console.log('1. Checking categories table...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(1)
    
    if (catError) {
      console.log('❌ Categories table error:', catError.message)
    } else {
      console.log('✅ Categories table exists')
      console.log(`   Current categories count: ${categories?.length || 0}`)
    }

    // Test 2: Check if subcategories table exists
    console.log('\n2. Checking subcategories table...')
    const { data: subcategories, error: subError } = await supabase
      .from('subcategories')
      .select('*')
      .limit(1)
    
    if (subError) {
      console.log('❌ Subcategories table error:', subError.message)
    } else {
      console.log('✅ Subcategories table exists')
      console.log(`   Current subcategories count: ${subcategories?.length || 0}`)
    }

    // Test 3: Check if news table exists
    console.log('\n3. Checking news table...')
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('*')
      .limit(1)
    
    if (newsError) {
      console.log('❌ News table error:', newsError.message)
    } else {
      console.log('✅ News table exists')
      console.log(`   Current news count: ${news?.length || 0}`)
    }

    // Test 4: Check if profiles table exists
    console.log('\n4. Checking profiles table...')
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profError) {
      console.log('❌ Profiles table error:', profError.message)
    } else {
      console.log('✅ Profiles table exists')
      console.log(`   Current profiles count: ${profiles?.length || 0}`)
    }

    // Test 5: Try to create a test category
    console.log('\n5. Creating a test category...')
    const { data: newCategory, error: createError } = await supabase
      .from('categories')
      .insert({
        name: 'Test Category',
        slug: 'test-category',
        description: 'This is a test category to verify database setup'
      })
      .select()
      .single()
    
    if (createError) {
      console.log('❌ Failed to create category:', createError.message)
      console.log('   This might be due to RLS policies or missing permissions')
    } else {
      console.log('✅ Test category created successfully')
      console.log(`   Category ID: ${newCategory.id}`)
      console.log(`   Category Name: ${newCategory.name}`)
      
      // Clean up the test category
      console.log('\n6. Cleaning up test category...')
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', newCategory.id)
      
      if (deleteError) {
        console.log('⚠️  Could not delete test category:', deleteError.message)
      } else {
        console.log('✅ Test category deleted successfully')
      }
    }

    console.log('\n=== Database Test Complete ===')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testDatabase()
