import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export const checkUsernameAvailability = async (username: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();
      
    if (error && error.code === 'PGRST116') {
      return true; // Not found, so it's available
    }
    return false; // Found, not available
  } catch (err) {
    console.error("Error checking username:", err);
    return false;
  }
};

export const fetchPinCodeDetails = async (pincode: string) => {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();
    if (data && data[0] && data[0].Status === 'Success') {
      const postOffice = data[0].PostOffice[0];
      return {
        city: postOffice.District,
        state: postOffice.State
      };
    }
    return null;
  } catch (err) {
    console.error("Error fetching pincode details:", err);
    return null;
  }
};

export const saveCreatorProfileStep = async (userId: string, data: any) => {
  try {
    const { error } = await supabase
      .from('creator_profiles')
      .upsert({ user_id: userId, ...data }, { onConflict: 'user_id' });
      
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error saving step data:", err);
    return false;
  }
};

export const uploadProfilePhoto = async (userId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/profile_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('creator-photos')
      .upload(filePath, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('creator-photos')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (err) {
    console.error("Upload error:", err);
    return null;
  }
};

export const sendOTP = async (email: string) => {
  console.log("Mock OTP sent to", email, "- Use 123456 to verify");
  return true;
};

export const verifyOTP = async (email: string, otp: string) => {
  if (otp === "123456") return true;
  return false;
};
