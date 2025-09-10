import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface KYCDocument {
  id: string;
  document_type: string;
  document_url: string;
  document_number?: string;
  expiry_date?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'incomplete';
  rejection_reason?: string;
  uploaded_at: string;
}

export interface KYCLimits {
  kyc_level: string;
  daily_withdrawal_limit: number;
  monthly_withdrawal_limit: number;
  yearly_withdrawal_limit: number;
  daily_deposit_limit: number;
  monthly_deposit_limit: number;
  total_balance_limit: number;
  requires_documents: string[];
}

export interface KYCVerification {
  id: string;
  requested_level: string;
  current_level: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'incomplete';
  submitted_documents: string[];
  admin_notes?: string;
  rejection_reason?: string;
  submitted_at: string;
}

export interface KYCLimitCheck {
  allowed: boolean;
  kyc_level: string;
  daily_limit: number;
  monthly_limit: number;
  yearly_limit: number;
  daily_used: number;
  monthly_used: number;
  yearly_used: number;
  daily_remaining: number;
  monthly_remaining: number;
  yearly_remaining: number;
  reason?: string;
}

export const useKYC = () => {
  const [userKYCLevel, setUserKYCLevel] = useState<string>('level_0');
  const [kycDocuments, setKYCDocuments] = useState<KYCDocument[]>([]);
  const [kycLimits, setKYCLimits] = useState<KYCLimits[]>([]);
  const [kycVerifications, setKYCVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get current user ID
  const getCurrentUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();
    
    return userData?.id;
  };

  // Fetch user's KYC level
  const fetchUserKYCLevel = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('kyc_level')
        .eq('auth_user_id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setUserKYCLevel(data.kyc_level || 'level_0');
      }
    } catch (error) {
      console.error('Error fetching KYC level:', error);
    }
  };

  // Fetch KYC documents
  const fetchKYCDocuments = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return;

      const { data, error } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKYCDocuments(data || []);
    } catch (error) {
      console.error('Error fetching KYC documents:', error);
    }
  };

  // Fetch KYC limits
  const fetchKYCLimits = async () => {
    try {
      const { data, error } = await supabase
        .from('kyc_limits')
        .select('*')
        .order('kyc_level');

      if (error) throw error;
      setKYCLimits(data || []);
    } catch (error) {
      console.error('Error fetching KYC limits:', error);
    }
  };

  // Fetch KYC verifications
  const fetchKYCVerifications = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return;

      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKYCVerifications(data || []);
    } catch (error) {
      console.error('Error fetching KYC verifications:', error);
    }
  };

  // Upload KYC document
  const uploadKYCDocument = async (
    file: File,
    documentType: string,
    documentNumber?: string,
    expiryDate?: string
  ) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not found');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      // Save document record  
      const { error: dbError } = await supabase
        .from('kyc_documents')
        .insert({
          user_id: userId,
          document_type: documentType as any,
          document_url: publicUrl,
          document_number: documentNumber,
          expiry_date: expiryDate,
          status: 'pending'
        });

      if (dbError) throw dbError;

      toast({
        title: "Belge Yüklendi",
        description: "KYC belgeniz başarıyla yüklendi. İnceleme süreci başladı.",
      });

      fetchKYCDocuments();
      return true;
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Submit KYC verification request
  const submitKYCVerification = async (targetLevel: string) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not found');

      // Get required documents for this level
      const { data: requiredDocs } = await supabase
        .rpc('get_required_kyc_documents', { _target_level: targetLevel });

      // Check if user has uploaded required documents
      const uploadedDocTypes = kycDocuments
        .filter(doc => doc.status === 'approved')
        .map(doc => doc.document_type);

      const missingDocs = requiredDocs?.filter((doc: any) => !uploadedDocTypes.includes(doc)) || [];
      
      if (missingDocs.length > 0) {
        toast({
          title: "Eksik Belgeler",
          description: `Bu seviye için şu belgeler gerekli: ${missingDocs.join(', ')}`,
          variant: "destructive",
        });
        return false;
      }

      // Get submitted document IDs
      const submittedDocIds = kycDocuments
        .filter(doc => requiredDocs?.includes(doc.document_type as any))
        .map(doc => doc.id);

      const { error } = await supabase
        .from('kyc_verifications')
        .insert({
          user_id: userId,
          requested_level: targetLevel as any,
          current_level: userKYCLevel as any,
          status: 'pending',
          submitted_documents: submittedDocIds
        });

      if (error) throw error;

      toast({
        title: "KYC Başvurusu Gönderildi",
        description: "KYC doğrulama talebiniz inceleme için gönderildi.",
      });

      fetchKYCVerifications();
      return true;
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Check withdrawal limits
  const checkWithdrawalLimit = async (amount: number): Promise<KYCLimitCheck | null> => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return null;

      const { data, error } = await supabase
        .rpc('check_kyc_withdrawal_limit', {
          _user_id: userId,
          _amount: amount
        });

      if (error) throw error;
      return data as unknown as KYCLimitCheck;
    } catch (error) {
      console.error('Error checking withdrawal limit:', error);
      return null;
    }
  };

  // Get document type display name
  const getDocumentTypeName = (type: string) => {
    const names: { [key: string]: string } = {
      'identity_card': 'Kimlik Kartı',
      'passport': 'Pasaport',
      'driving_license': 'Ehliyet',
      'utility_bill': 'Fatura',
      'bank_statement': 'Banka Ekstresi',
      'address_proof': 'Adres Belgesi',
      'selfie_with_id': 'Kimlik ile Selfie'
    };
    return names[type] || type;
  };

  // Get KYC level display name
  const getKYCLevelName = (level: string) => {
    const names: { [key: string]: string } = {
      'level_0': 'Doğrulanmamış',
      'level_1': 'Temel Doğrulama',
      'level_2': 'Orta Doğrulama', 
      'level_3': 'Tam Doğrulama'
    };
    return names[level] || level;
  };

  // Initialize
  useEffect(() => {
    const initializeKYC = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserKYCLevel(),
        fetchKYCDocuments(),
        fetchKYCLimits(),
        fetchKYCVerifications()
      ]);
      setLoading(false);
    };

    initializeKYC();
  }, []);

  return {
    userKYCLevel,
    kycDocuments,
    kycLimits,
    kycVerifications,
    loading,
    uploadKYCDocument,
    submitKYCVerification,
    checkWithdrawalLimit,
    getDocumentTypeName,
    getKYCLevelName,
    refreshData: () => {
      fetchUserKYCLevel();
      fetchKYCDocuments();
      fetchKYCVerifications();
    }
  };
};