-- ==========================================
-- 28-enhanced-user-management-functions.sql
-- Enhanced User Management with Auth Integration
-- ==========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- User Creation with Supabase Auth Integration
-- ==========================================

-- Function to generate secure random password
CREATE OR REPLACE FUNCTION public.generate_secure_password(length INTEGER DEFAULT 12)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user with Supabase Auth
CREATE OR REPLACE FUNCTION public.admin_create_user(
  p_email TEXT,
  p_full_name TEXT,
  p_role TEXT DEFAULT 'customer',
  p_phone TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT true,
  p_send_email BOOLEAN DEFAULT true
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_password TEXT;
  v_result JSONB;
  v_auth_user JSONB;
BEGIN
  -- Validate inputs
  IF p_email IS NULL OR p_email = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email is required');
  END IF;
  
  IF p_full_name IS NULL OR p_full_name = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Full name is required');
  END IF;
  
  IF p_role NOT IN ('admin', 'seller', 'customer') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid role specified');
  END IF;

  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User with this email already exists');
  END IF;

  -- Generate secure password
  v_password := public.generate_secure_password(12);
  
  -- Create user in auth.users using admin API
  -- Note: This requires service role permissions
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(v_password, gen_salt('bf')),
    CASE WHEN p_send_email THEN NULL ELSE NOW() END,
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('full_name', p_full_name, 'role', p_role),
    NOW(),
    NOW(),
    CASE WHEN p_send_email THEN encode(gen_random_bytes(32), 'base64') ELSE NULL END,
    '',
    '',
    ''
  ) RETURNING id INTO v_user_id;

  -- Create profile record
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    phone,
    date_of_birth,
    is_active,
    email_verified,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_email,
    p_full_name,
    p_role,
    p_phone,
    p_date_of_birth,
    p_is_active,
    NOT p_send_email, -- If not sending email, mark as verified
    NOW(),
    NOW()
  );

  -- Log the user creation event
  INSERT INTO public.auth_audit_log (
    user_id,
    event_type,
    metadata
  ) VALUES (
    v_user_id,
    'user_created_by_admin',
    jsonb_build_object(
      'created_by', auth.uid(),
      'role', p_role,
      'email_confirmation_required', p_send_email
    )
  );

  -- Prepare result
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_email,
    'password', v_password,
    'confirmation_required', p_send_email,
    'message', 'User created successfully'
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to create user: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- Email Confirmation Functions
-- ==========================================

-- Function to resend confirmation email
CREATE OR REPLACE FUNCTION public.admin_resend_confirmation(
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_email TEXT;
  v_token TEXT;
BEGIN
  -- Check if user exists and is not confirmed
  SELECT email INTO v_email
  FROM auth.users 
  WHERE id = p_user_id AND email_confirmed_at IS NULL;
  
  IF v_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found or already confirmed');
  END IF;

  -- Generate new confirmation token
  v_token := encode(gen_random_bytes(32), 'base64');
  
  -- Update user with new token
  UPDATE auth.users 
  SET 
    confirmation_token = v_token,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log the event
  INSERT INTO public.auth_audit_log (
    user_id,
    event_type,
    metadata
  ) VALUES (
    p_user_id,
    'confirmation_resent',
    jsonb_build_object('resent_by', auth.uid())
  );

  RETURN jsonb_build_object(
    'success', true,
    'email', v_email,
    'token', v_token,
    'message', 'Confirmation email resent'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to resend confirmation: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to manually confirm user email
CREATE OR REPLACE FUNCTION public.admin_confirm_user_email(
  p_user_id UUID
)
RETURNS JSONB AS $$
BEGIN
  -- Update user confirmation status
  UPDATE auth.users 
  SET 
    email_confirmed_at = NOW(),
    confirmation_token = '',
    updated_at = NOW()
  WHERE id = p_user_id AND email_confirmed_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found or already confirmed');
  END IF;

  -- Update profile
  UPDATE public.profiles 
  SET 
    email_verified = true,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log the event
  INSERT INTO public.auth_audit_log (
    user_id,
    event_type,
    metadata
  ) VALUES (
    p_user_id,
    'email_confirmed_by_admin',
    jsonb_build_object('confirmed_by', auth.uid())
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User email confirmed successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to confirm email: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- Enhanced User Management Functions
-- ==========================================

-- Function to update user with enhanced features
CREATE OR REPLACE FUNCTION public.admin_update_user(
  p_user_id UUID,
  p_email TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL,
  p_reset_password BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
  v_new_password TEXT;
  v_old_data JSONB;
  v_changes JSONB := '{}';
BEGIN
  -- Get current user data for audit
  SELECT jsonb_build_object(
    'email', email,
    'full_name', full_name,
    'role', role,
    'phone', phone,
    'date_of_birth', date_of_birth,
    'is_active', is_active
  ) INTO v_old_data
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_old_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Update auth.users if email changed
  IF p_email IS NOT NULL AND p_email != (v_old_data->>'email') THEN
    UPDATE auth.users SET email = p_email, updated_at = NOW() WHERE id = p_user_id;
    v_changes := v_changes || jsonb_build_object('email', jsonb_build_object('old', v_old_data->>'email', 'new', p_email));
  END IF;

  -- Reset password if requested
  IF p_reset_password THEN
    v_new_password := public.generate_secure_password(12);
    UPDATE auth.users 
    SET 
      encrypted_password = crypt(v_new_password, gen_salt('bf')),
      updated_at = NOW()
    WHERE id = p_user_id;
    v_changes := v_changes || jsonb_build_object('password_reset', true);
  END IF;

  -- Update profile
  UPDATE public.profiles SET
    email = COALESCE(p_email, email),
    full_name = COALESCE(p_full_name, full_name),
    role = COALESCE(p_role, role),
    phone = COALESCE(p_phone, phone),
    date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log the changes
  INSERT INTO public.auth_audit_log (
    user_id,
    event_type,
    metadata
  ) VALUES (
    p_user_id,
    'user_updated_by_admin',
    jsonb_build_object(
      'updated_by', auth.uid(),
      'changes', v_changes
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_password', v_new_password,
    'message', 'User updated successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to update user: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- Security and Permissions
-- ==========================================

-- Grant permissions to service role
GRANT EXECUTE ON FUNCTION public.generate_secure_password(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_create_user(TEXT, TEXT, TEXT, TEXT, DATE, BOOLEAN, BOOLEAN) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_resend_confirmation(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_confirm_user_email(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_user(UUID, TEXT, TEXT, TEXT, TEXT, DATE, BOOLEAN, BOOLEAN) TO service_role;

-- Grant permissions to authenticated users (admins only through RLS)
GRANT EXECUTE ON FUNCTION public.admin_create_user(TEXT, TEXT, TEXT, TEXT, DATE, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_resend_confirmation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_confirm_user_email(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user(UUID, TEXT, TEXT, TEXT, TEXT, DATE, BOOLEAN, BOOLEAN) TO authenticated;
