import { supabase } from '@/integrations/supabase/client';

const createSuperAdmin = async () => {
  try {
    // Create auth user first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'superadmin@casino.com',
      password: 'SuperAdmin123!',
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return;
    }

    console.log('Super admin created successfully:', authData.user.email);
    
    // Update the admins table with the correct auth user ID
    const { error: updateError } = await supabase
      .from('admins')
      .update({ id: authData.user.id })
      .eq('email', 'superadmin@casino.com');

    if (updateError) {
      console.error('Admin table update error:', updateError);
      return;
    }

    console.log('Admin table updated with auth user ID');
    return { success: true, message: 'Super admin created successfully' };
    
  } catch (error) {
    console.error('Error creating super admin:', error);
    return { success: false, error };
  }
};

// Call the function
createSuperAdmin().then(result => {
  if (result?.success) {
    console.log('✅ Super admin setup complete');
  } else {
    console.error('❌ Super admin setup failed');
  }
});

export { createSuperAdmin };