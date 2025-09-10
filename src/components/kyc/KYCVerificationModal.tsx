import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useKYC } from '@/hooks/useKYC';
import { Shield, Upload, CheckCircle, Clock, AlertTriangle, Camera, FileText } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

interface KYCVerificationModalProps {
  children: React.ReactNode;
  forceOpen?: boolean;
  onClose?: () => void;
}

const KYCVerificationModal: React.FC<KYCVerificationModalProps> = ({ 
  children, 
  forceOpen = false,
  onClose 
}) => {
  const { t } = useI18n();
  const {
    userKYCLevel,
    kycDocuments,
    kycLimits,
    kycVerifications,
    loading,
    uploadKYCDocument,
    submitKYCVerification,
    getDocumentTypeName,
    getKYCLevelName
  } = useKYC();

  const [open, setOpen] = useState(forceOpen);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('identity_card');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const currentLimits = kycLimits.find(limit => limit.kyc_level === userKYCLevel);
  const nextLevel = getNextKYCLevel(userKYCLevel);
  const nextLimits = kycLimits.find(limit => limit.kyc_level === nextLevel);

  function getNextKYCLevel(currentLevel: string): string {
    const levels = ['level_0', 'level_1', 'level_2', 'level_3'];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : currentLevel;
  }

  const getKYCProgress = () => {
    const levels = ['level_0', 'level_1', 'level_2', 'level_3'];
    const currentIndex = levels.indexOf(userKYCLevel);
    return ((currentIndex + 1) / levels.length) * 100;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Dosya boyutu 10MB\'dan küçük olmalıdır.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const success = await uploadKYCDocument(
      selectedFile,
      documentType,
      documentNumber || undefined,
      expiryDate || undefined
    );

    if (success) {
      setSelectedFile(null);
      setDocumentNumber('');
      setExpiryDate('');
    }
    setUploading(false);
  };

  const handleLevelUpgrade = async () => {
    if (nextLevel === userKYCLevel) return;
    await submitKYCVerification(nextLevel);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'under_review': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      case 'under_review': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>{t('kyc.loading', 'Loading KYC information...')}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={forceOpen ? handleClose : setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {t('kyc.title', 'KYC Verification')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('kyc.currentStatus', 'Current Status')}</span>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {getKYCLevelName(userKYCLevel)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{t('kyc.verificationProgress', 'Verification Progress')}</span>
                    <span className="text-sm text-muted-foreground">{Math.round(getKYCProgress())}%</span>
                  </div>
                  <Progress value={getKYCProgress()} className="h-2" />
                </div>

                {currentLimits && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        ₺{currentLimits.daily_withdrawal_limit.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">{t('kyc.dailyLimit', 'Daily Limit')}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        ₺{currentLimits.monthly_withdrawal_limit.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">{t('kyc.monthlyLimit', 'Monthly Limit')}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        ₺{currentLimits.daily_deposit_limit.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">{t('kyc.depositLimit', 'Deposit Limit')}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        ₺{currentLimits.total_balance_limit.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">{t('kyc.balanceLimit', 'Balance Limit')}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="documents">{t('kyc.documents', 'Documents')}</TabsTrigger>
              <TabsTrigger value="upgrade">{t('kyc.upgrade', 'Upgrade Level')}</TabsTrigger>
              <TabsTrigger value="history">{t('kyc.history', 'History')}</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    {t('kyc.uploadDocument', 'Upload Document')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="documentType">{t('kyc.documentType', 'Document Type')}</Label>
                      <select
                        id="documentType"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="identity_card">{t('kyc.identityCard', 'Identity Card')}</option>
                        <option value="passport">{t('kyc.passport', 'Passport')}</option>
                        <option value="driving_license">{t('kyc.drivingLicense', 'Driving License')}</option>
                        <option value="utility_bill">{t('kyc.utilityBill', 'Utility Bill')}</option>
                        <option value="bank_statement">{t('kyc.bankStatement', 'Bank Statement')}</option>
                        <option value="address_proof">{t('kyc.addressProof', 'Address Proof')}</option>
                        <option value="selfie_with_id">{t('kyc.selfieWithId', 'Selfie with ID')}</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="documentFile">{t('kyc.selectFile', 'Select File')}</Label>
                      <Input
                        id="documentFile"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="documentNumber">{t('kyc.documentNumber', 'Document Number (Optional)')}</Label>
                      <Input
                        id="documentNumber"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        placeholder={t('kyc.documentNumberPlaceholder', 'Enter document number')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">{t('kyc.expiryDate', 'Expiry Date (Optional)')}</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="w-full"
                  >
                    {uploading ? t('kyc.uploading', 'Uploading...') : t('kyc.uploadBtn', 'Upload Document')}
                  </Button>
                </CardContent>
              </Card>

              {/* Uploaded Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('kyc.uploadedDocuments', 'Uploaded Documents')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {kycDocuments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      {t('kyc.noDocuments', 'No documents uploaded yet')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {kycDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{getDocumentTypeName(doc.document_type)}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(doc.uploaded_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(doc.status)}>
                              {getStatusIcon(doc.status)}
                              <span className="ml-1">{t(`kyc.status.${doc.status}`, doc.status)}</span>
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upgrade" className="space-y-4">
              {nextLevel !== userKYCLevel && nextLimits ? (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t('kyc.upgradeToLevel', 'Upgrade to')} {getKYCLevelName(nextLevel)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        {t('kyc.upgradeDesc', 'Upgrading your KYC level will increase your transaction limits and unlock more features.')}
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ₺{nextLimits.daily_withdrawal_limit.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('kyc.dailyLimit', 'Daily Limit')}</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ₺{nextLimits.monthly_withdrawal_limit.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('kyc.monthlyLimit', 'Monthly Limit')}</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ₺{nextLimits.daily_deposit_limit.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('kyc.depositLimit', 'Deposit Limit')}</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ₺{nextLimits.total_balance_limit.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('kyc.balanceLimit', 'Balance Limit')}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">{t('kyc.requiredDocuments', 'Required Documents')}</h4>
                      <div className="space-y-2">
                        {nextLimits.requires_documents.map((docType) => {
                          const hasDoc = kycDocuments.some(
                            doc => doc.document_type === docType && doc.status === 'approved'
                          );
                          return (
                            <div key={docType} className="flex items-center gap-2">
                              {hasDoc ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className={hasDoc ? 'text-green-600' : 'text-muted-foreground'}>
                                {getDocumentTypeName(docType)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button onClick={handleLevelUpgrade} className="w-full">
                      {t('kyc.requestUpgrade', 'Request Level Upgrade')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t('kyc.maxLevel', 'Maximum KYC Level Reached')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('kyc.maxLevelDesc', 'You have reached the highest KYC verification level with maximum limits.')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('kyc.verificationHistory', 'Verification History')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {kycVerifications.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      {t('kyc.noHistory', 'No verification history')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {kycVerifications.map((verification) => (
                        <div key={verification.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">
                              {getKYCLevelName(verification.requested_level)}
                            </div>
                            <Badge className={getStatusColor(verification.status)}>
                              {getStatusIcon(verification.status)}
                              <span className="ml-1">{t(`kyc.status.${verification.status}`, verification.status)}</span>
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t('kyc.submittedAt', 'Submitted')}: {new Date(verification.submitted_at).toLocaleDateString()}
                          </div>
                          {verification.rejection_reason && (
                            <div className="text-sm text-red-600 mt-2">
                              {t('kyc.rejectionReason', 'Rejection Reason')}: {verification.rejection_reason}
                            </div>
                          )}
                          {verification.admin_notes && (
                            <div className="text-sm text-muted-foreground mt-2">
                              {t('kyc.adminNotes', 'Admin Notes')}: {verification.admin_notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KYCVerificationModal;