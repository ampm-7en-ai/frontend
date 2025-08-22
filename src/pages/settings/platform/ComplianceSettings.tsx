import React from 'react';
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { ModernInput } from '@/components/ui/modern-input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModernButton from '@/components/dashboard/ModernButton';

const ComplianceSettings = () => {
  return (
    <PlatformSettingsLayout
      title="Compliance Settings"
      description="Manage compliance features and regulatory requirements"
    >
      <Tabs defaultValue="privacy" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30 p-1 rounded-xl">
          <TabsTrigger value="privacy" className="rounded-lg">Privacy Settings</TabsTrigger>
          <TabsTrigger value="data" className="rounded-lg">Data Management</TabsTrigger>
          <TabsTrigger value="gdpr" className="rounded-lg">GDPR / CCPA</TabsTrigger>
          <TabsTrigger value="aiact" className="rounded-lg">AI Act</TabsTrigger>
        </TabsList>
        
        <TabsContent value="privacy">
          <ModernCard variant="glass" className="p-8">
            <ModernCardHeader className="pb-6">
              <ModernCardTitle className="text-2xl">Privacy Configuration</ModernCardTitle>
              <ModernCardDescription className="text-base">
                Configure data privacy settings and policies
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="pt-0 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="dataRetention" className="text-sm font-medium">Data Retention Controls</Label>
                    <p className="text-sm text-muted-foreground mt-1">Enable automatic data deletion after specified period</p>
                  </div>
                  <Switch id="dataRetention" defaultChecked />
                </div>
                
                <div className="pl-6 space-y-3">
                  <Label htmlFor="retentionPeriod" className="text-sm font-medium">Retention Period (days)</Label>
                  <ModernInput id="retentionPeriod" type="number" defaultValue="180" variant="modern" className="h-12" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="anonymization" className="text-sm font-medium">Data Anonymization</Label>
                    <p className="text-sm text-muted-foreground mt-1">Automatically anonymize personal data in logs and analytics</p>
                  </div>
                  <Switch id="anonymization" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="piiDetection" className="text-sm font-medium">PII Detection</Label>
                    <p className="text-sm text-muted-foreground mt-1">Scan conversations for personally identifiable information</p>
                  </div>
                  <Switch id="piiDetection" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="encryptData" className="text-sm font-medium">Data Encryption</Label>
                    <p className="text-sm text-muted-foreground mt-1">Enable end-to-end encryption for sensitive data</p>
                  </div>
                  <Switch id="encryptData" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-6 pt-8 border-t border-border/20">
                <h3 className="text-lg font-semibold">Privacy Policy</h3>
                <div className="space-y-3">
                  <Label htmlFor="privacyUrl" className="text-sm font-medium">Privacy Policy URL</Label>
                  <ModernInput id="privacyUrl" defaultValue="https://example.com/privacy" variant="modern" className="h-12" />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="privacyNotice" className="text-sm font-medium">Privacy Notice for Users</Label>
                  <Textarea
                    id="privacyNotice"
                    className="min-h-[120px] bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl resize-none"
                    defaultValue="Your privacy is important to us. This platform collects and processes data in accordance with our privacy policy. You can request deletion of your data at any time."
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <Label htmlFor="showPrivacyNotice" className="text-sm font-medium">Show privacy notice during onboarding</Label>
                  <Switch id="showPrivacyNotice" defaultChecked />
                </div>
              </div>
              
              <div className="flex justify-end pt-8 border-t border-border/20">
                <ModernButton variant="primary" className="px-8 py-3">Save Privacy Settings</ModernButton>
              </div>
            </ModernCardContent>
          </ModernCard>
        </TabsContent>
        
        <TabsContent value="data">
          <ModernCard variant="glass" className="p-8">
            <ModernCardHeader className="pb-6">
              <ModernCardTitle className="text-2xl">Data Management</ModernCardTitle>
              <ModernCardDescription className="text-base">
                Configure data handling and storage policies
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="pt-0 space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="dataStorage" className="text-sm font-medium">Data Storage Location</Label>
                  <Select defaultValue="eu">
                    <SelectTrigger id="dataStorage" variant="modern">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent variant="modern">
                      <SelectItem value="eu" variant="modern">European Union (EU)</SelectItem>
                      <SelectItem value="us" variant="modern">United States (US)</SelectItem>
                      <SelectItem value="ap" variant="modern">Asia Pacific (AP)</SelectItem>
                      <SelectItem value="ca" variant="modern">Canada (CA)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Primary storage location for user data</p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="dataResidency" className="text-sm font-medium">Strict Data Residency</Label>
                    <p className="text-sm text-muted-foreground mt-1">Enforce that data never leaves selected region</p>
                  </div>
                  <Switch id="dataResidency" defaultChecked />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="backupSchedule" className="text-sm font-medium">Backup Schedule</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger id="backupSchedule" variant="modern">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent variant="modern">
                      <SelectItem value="hourly" variant="modern">Hourly</SelectItem>
                      <SelectItem value="daily" variant="modern">Daily</SelectItem>
                      <SelectItem value="weekly" variant="modern">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="backupRetention" className="text-sm font-medium">Backup Retention (days)</Label>
                  <ModernInput id="backupRetention" type="number" defaultValue="30" variant="modern" className="h-12" />
                </div>
              </div>
              
              <div className="space-y-6 pt-8 border-t border-border/20">
                <h3 className="text-lg font-semibold">Data Processing Controls</h3>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="thirdPartySharing" className="text-sm font-medium">Allow Third Party Data Sharing</Label>
                    <p className="text-sm text-muted-foreground mt-1">Allow data to be shared with third-party services</p>
                  </div>
                  <Switch id="thirdPartySharing" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="modelTraining" className="text-sm font-medium">Allow Data Usage for Model Training</Label>
                    <p className="text-sm text-muted-foreground mt-1">Allow user data to be used for improving AI models</p>
                  </div>
                  <Switch id="modelTraining" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="analyticsCollection" className="text-sm font-medium">Collect Usage Analytics</Label>
                    <p className="text-sm text-muted-foreground mt-1">Collect anonymized usage statistics</p>
                  </div>
                  <Switch id="analyticsCollection" defaultChecked />
                </div>
              </div>
              
              <div className="flex justify-end pt-8 border-t border-border/20">
                <ModernButton variant="primary" className="px-8 py-3">Save Data Settings</ModernButton>
              </div>
            </ModernCardContent>
          </ModernCard>
        </TabsContent>
        
        <TabsContent value="gdpr">
          <ModernCard variant="glass" className="p-8">
            <ModernCardHeader className="pb-6">
              <ModernCardTitle className="text-2xl">GDPR / CCPA Compliance</ModernCardTitle>
              <ModernCardDescription className="text-base">
                Configure settings for compliance with data protection regulations
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="pt-0 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="gdprEnabled" className="text-sm font-medium">Enable GDPR Features</Label>
                    <p className="text-sm text-muted-foreground mt-1">Activate tools for GDPR compliance</p>
                  </div>
                  <Switch id="gdprEnabled" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="ccpaEnabled" className="text-sm font-medium">Enable CCPA Features</Label>
                    <p className="text-sm text-muted-foreground mt-1">Activate tools for CCPA compliance</p>
                  </div>
                  <Switch id="ccpaEnabled" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-6 pt-8 border-t border-border/20">
                <h3 className="text-lg font-semibold">Data Subject Rights</h3>
                
                <div className="space-y-3">
                  <Label htmlFor="dpoEmail" className="text-sm font-medium">Data Protection Officer Email</Label>
                  <ModernInput id="dpoEmail" type="email" defaultValue="dpo@example.com" variant="modern" className="h-12" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="selfServiceDeletion" className="text-sm font-medium">Allow Self-Service Data Deletion</Label>
                    <p className="text-sm text-muted-foreground mt-1">Users can delete their own data from account settings</p>
                  </div>
                  <Switch id="selfServiceDeletion" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="dataExport" className="text-sm font-medium">Allow Self-Service Data Export</Label>
                    <p className="text-sm text-muted-foreground mt-1">Users can export their data in machine-readable format</p>
                  </div>
                  <Switch id="dataExport" defaultChecked />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="requestProcessTime" className="text-sm font-medium">Max Request Processing Time (days)</Label>
                  <ModernInput id="requestProcessTime" type="number" defaultValue="30" variant="modern" className="h-12" />
                  <p className="text-xs text-muted-foreground">Maximum time to process data subject requests</p>
                </div>
              </div>
              
              <div className="space-y-6 pt-8 border-t border-border/20">
                <h3 className="text-lg font-semibold">Consent Management</h3>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="consentRequired" className="text-sm font-medium">Require Explicit Consent</Label>
                    <p className="text-sm text-muted-foreground mt-1">Require users to explicitly opt-in to data processing</p>
                  </div>
                  <Switch id="consentRequired" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="consentAudit" className="text-sm font-medium">Audit Consent Changes</Label>
                    <p className="text-sm text-muted-foreground mt-1">Log all changes to user consent preferences</p>
                  </div>
                  <Switch id="consentAudit" defaultChecked />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="consentText" className="text-sm font-medium">Consent Request Text</Label>
                  <Textarea
                    id="consentText"
                    className="min-h-[120px] bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl resize-none"
                    defaultValue="We process your data to provide our services. You can withdraw consent at any time. See our privacy policy for details."
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-8 border-t border-border/20">
                <ModernButton variant="primary" className="px-8 py-3">Save GDPR/CCPA Settings</ModernButton>
              </div>
            </ModernCardContent>
          </ModernCard>
        </TabsContent>
        
        <TabsContent value="aiact">
          <ModernCard variant="glass" className="p-8">
            <ModernCardHeader className="pb-6">
              <ModernCardTitle className="text-2xl">EU AI Act Compliance</ModernCardTitle>
              <ModernCardDescription className="text-base">
                Configure settings for compliance with the EU AI Act
              </ModernCardDescription>
            </ModernCardHeader>
            <ModernCardContent className="pt-0 space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Risk Assessment</h3>
                
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl border border-border/20 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/20">
                        <TableHead className="py-4 px-6 font-semibold">System Component</TableHead>
                        <TableHead className="py-4 px-6 font-semibold">Risk Level</TableHead>
                        <TableHead className="py-4 px-6 font-semibold">Compliance Status</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-border/10 hover:bg-muted/30">
                        <TableCell className="py-4 px-6 font-medium">Agent Response System</TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Medium</Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge variant="outline" className="bg-green-50 text-green-700">Compliant</Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <ModernButton variant="ghost" size="sm" className="px-4 py-2">View Report</ModernButton>
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-border/10 hover:bg-muted/30">
                        <TableCell className="py-4 px-6 font-medium">Content Moderation</TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">High</Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">In Review</Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <ModernButton variant="ghost" size="sm" className="px-4 py-2">View Report</ModernButton>
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-border/10 hover:bg-muted/30">
                        <TableCell className="py-4 px-6 font-medium">Knowledge Management</TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge variant="outline" className="bg-green-50 text-green-700">Low</Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge variant="outline" className="bg-green-50 text-green-700">Compliant</Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <ModernButton variant="ghost" size="sm" className="px-4 py-2">View Report</ModernButton>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <ModernButton variant="outline" className="mt-6">Run New Risk Assessment</ModernButton>
              </div>
              
              <div className="space-y-6 pt-8 border-t border-border/20">
                <h3 className="text-lg font-semibold">Transparency Documentation</h3>
                
                <div className="space-y-3">
                  <Label htmlFor="technicalDoc" className="text-sm font-medium">Technical Documentation</Label>
                  <div className="flex gap-3">
                    <ModernInput id="technicalDoc" defaultValue="AI_System_Technical_Doc_v1.3.pdf" readOnly variant="modern" className="flex-1 h-12" />
                    <ModernButton variant="outline" className="px-6">Upload New</ModernButton>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="riskAssessmentDoc" className="text-sm font-medium">Risk Assessment Documentation</Label>
                  <div className="flex gap-3">
                    <ModernInput id="riskAssessmentDoc" defaultValue="Risk_Assessment_Report_Q2_2025.pdf" readOnly variant="modern" className="flex-1 h-12" />
                    <ModernButton variant="outline" className="px-6">Upload New</ModernButton>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="userManual" className="text-sm font-medium">User Instructions</Label>
                  <div className="flex gap-3">
                    <ModernInput id="userManual" defaultValue="Platform_User_Manual.pdf" readOnly variant="modern" className="flex-1 h-12" />
                    <ModernButton variant="outline" className="px-6">Upload New</ModernButton>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 pt-8 border-t border-border/20">
                <h3 className="text-lg font-semibold">Human Oversight</h3>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="humanReview" className="text-sm font-medium">Enable Human Review</Label>
                    <p className="text-sm text-muted-foreground mt-1">Flag high-risk decisions for human review</p>
                  </div>
                  <Switch id="humanReview" defaultChecked />
                </div>
                
                <div className="pl-6 space-y-3">
                  <Label htmlFor="reviewThreshold" className="text-sm font-medium">Review Threshold (%)</Label>
                  <ModernInput id="reviewThreshold" type="number" defaultValue="85" min="0" max="100" variant="modern" className="h-12" />
                  <p className="text-xs text-muted-foreground">Confidence threshold for automatic approvals</p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div className="flex-1">
                    <Label htmlFor="notifyOversight" className="text-sm font-medium">Notify Oversight Team</Label>
                    <p className="text-sm text-muted-foreground mt-1">Send notifications when human review is needed</p>
                  </div>
                  <Switch id="notifyOversight" defaultChecked />
                </div>
              </div>
              
              <div className="flex justify-end pt-8 border-t border-border/20">
                <ModernButton variant="primary" className="px-8 py-3">Save AI Act Settings</ModernButton>
              </div>
            </ModernCardContent>
          </ModernCard>
        </TabsContent>
      </Tabs>
    </PlatformSettingsLayout>
  );
};

export default ComplianceSettings;
