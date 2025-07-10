import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ComplianceSettings = () => {
  return (
    <PlatformSettingsLayout
      title="Compliance Settings"
      description="Manage compliance features and regulatory requirements"
    >
      <Tabs defaultValue="privacy">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR / CCPA</TabsTrigger>
          <TabsTrigger value="aiact">AI Act</TabsTrigger>
        </TabsList>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Configuration</CardTitle>
              <CardDescription>Configure data privacy settings and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="dataRetention" defaultChecked />
                  <div>
                    <Label htmlFor="dataRetention">Data Retention Controls</Label>
                    <p className="text-sm text-muted-foreground">Enable automatic data deletion after specified period</p>
                  </div>
                </div>
                
                <div className="pl-6 space-y-2">
                  <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
                  <Input id="retentionPeriod" type="number" defaultValue="180" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="anonymization" defaultChecked />
                  <div>
                    <Label htmlFor="anonymization">Data Anonymization</Label>
                    <p className="text-sm text-muted-foreground">Automatically anonymize personal data in logs and analytics</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="piiDetection" defaultChecked />
                  <div>
                    <Label htmlFor="piiDetection">PII Detection</Label>
                    <p className="text-sm text-muted-foreground">Scan conversations for personally identifiable information</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="encryptData" defaultChecked />
                  <div>
                    <Label htmlFor="encryptData">Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">Enable end-to-end encryption for sensitive data</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Privacy Policy</h3>
                <div className="space-y-2">
                  <Label htmlFor="privacyUrl">Privacy Policy URL</Label>
                  <Input id="privacyUrl" defaultValue="https://example.com/privacy" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="privacyNotice">Privacy Notice for Users</Label>
                  <Textarea
                    id="privacyNotice"
                    className="h-40"
                    defaultValue="Your privacy is important to us. This platform collects and processes data in accordance with our privacy policy. You can request deletion of your data at any time."
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="showPrivacyNotice" defaultChecked />
                  <Label htmlFor="showPrivacyNotice">Show privacy notice during onboarding</Label>
                </div>
              </div>
              
              <Button>Save Privacy Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Configure data handling and storage policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataStorage">Data Storage Location</Label>
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
                
                <div className="flex items-center space-x-2">
                  <Switch id="dataResidency" defaultChecked />
                  <div>
                    <Label htmlFor="dataResidency">Strict Data Residency</Label>
                    <p className="text-sm text-muted-foreground">Enforce that data never leaves selected region</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backupSchedule">Backup Schedule</Label>
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
                
                <div className="space-y-2">
                  <Label htmlFor="backupRetention">Backup Retention (days)</Label>
                  <Input id="backupRetention" type="number" defaultValue="30" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Processing Controls</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch id="thirdPartySharing" />
                  <div>
                    <Label htmlFor="thirdPartySharing">Allow Third Party Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow data to be shared with third-party services</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="modelTraining" />
                  <div>
                    <Label htmlFor="modelTraining">Allow Data Usage for Model Training</Label>
                    <p className="text-sm text-muted-foreground">Allow user data to be used for improving AI models</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="analyticsCollection" defaultChecked />
                  <div>
                    <Label htmlFor="analyticsCollection">Collect Usage Analytics</Label>
                    <p className="text-sm text-muted-foreground">Collect anonymized usage statistics</p>
                  </div>
                </div>
              </div>
              
              <Button>Save Data Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gdpr">
          <Card>
            <CardHeader>
              <CardTitle>GDPR / CCPA Compliance</CardTitle>
              <CardDescription>Configure settings for compliance with data protection regulations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="gdprEnabled" defaultChecked />
                  <div>
                    <Label htmlFor="gdprEnabled">Enable GDPR Features</Label>
                    <p className="text-sm text-muted-foreground">Activate tools for GDPR compliance</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="ccpaEnabled" defaultChecked />
                  <div>
                    <Label htmlFor="ccpaEnabled">Enable CCPA Features</Label>
                    <p className="text-sm text-muted-foreground">Activate tools for CCPA compliance</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Subject Rights</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="dpoEmail">Data Protection Officer Email</Label>
                  <Input id="dpoEmail" type="email" defaultValue="dpo@example.com" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="selfServiceDeletion" defaultChecked />
                  <div>
                    <Label htmlFor="selfServiceDeletion">Allow Self-Service Data Deletion</Label>
                    <p className="text-sm text-muted-foreground">Users can delete their own data from account settings</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="dataExport" defaultChecked />
                  <div>
                    <Label htmlFor="dataExport">Allow Self-Service Data Export</Label>
                    <p className="text-sm text-muted-foreground">Users can export their data in machine-readable format</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requestProcessTime">Max Request Processing Time (days)</Label>
                  <Input id="requestProcessTime" type="number" defaultValue="30" />
                  <p className="text-xs text-muted-foreground">Maximum time to process data subject requests</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Consent Management</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch id="consentRequired" defaultChecked />
                  <div>
                    <Label htmlFor="consentRequired">Require Explicit Consent</Label>
                    <p className="text-sm text-muted-foreground">Require users to explicitly opt-in to data processing</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="consentAudit" defaultChecked />
                  <div>
                    <Label htmlFor="consentAudit">Audit Consent Changes</Label>
                    <p className="text-sm text-muted-foreground">Log all changes to user consent preferences</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="consentText">Consent Request Text</Label>
                  <Textarea
                    id="consentText"
                    className="h-24"
                    defaultValue="We process your data to provide our services. You can withdraw consent at any time. See our privacy policy for details."
                  />
                </div>
              </div>
              
              <Button>Save GDPR/CCPA Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="aiact">
          <Card>
            <CardHeader>
              <CardTitle>EU AI Act Compliance</CardTitle>
              <CardDescription>Configure settings for compliance with the EU AI Act</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Risk Assessment</h3>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>System Component</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Compliance Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Agent Response System</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Medium</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Compliant</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View Report</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Content Moderation</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">High</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">In Review</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View Report</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Knowledge Management</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Low</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Compliant</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View Report</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <Button variant="outline" className="mt-2">Run New Risk Assessment</Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Transparency Documentation</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="technicalDoc">Technical Documentation</Label>
                  <div className="flex gap-2">
                    <Input id="technicalDoc" defaultValue="AI_System_Technical_Doc_v1.3.pdf" readOnly className="flex-1" />
                    <Button variant="outline">Upload New</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="riskAssessmentDoc">Risk Assessment Documentation</Label>
                  <div className="flex gap-2">
                    <Input id="riskAssessmentDoc" defaultValue="Risk_Assessment_Report_Q2_2025.pdf" readOnly className="flex-1" />
                    <Button variant="outline">Upload New</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userManual">User Instructions</Label>
                  <div className="flex gap-2">
                    <Input id="userManual" defaultValue="Platform_User_Manual.pdf" readOnly className="flex-1" />
                    <Button variant="outline">Upload New</Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Human Oversight</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch id="humanReview" defaultChecked />
                  <div>
                    <Label htmlFor="humanReview">Enable Human Review</Label>
                    <p className="text-sm text-muted-foreground">Flag high-risk decisions for human review</p>
                  </div>
                </div>
                
                <div className="pl-6 space-y-2">
                  <Label htmlFor="reviewThreshold">Review Threshold (%)</Label>
                  <Input id="reviewThreshold" type="number" defaultValue="85" min="0" max="100" />
                  <p className="text-xs text-muted-foreground">Confidence threshold for automatic approvals</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="notifyOversight" defaultChecked />
                  <div>
                    <Label htmlFor="notifyOversight">Notify Oversight Team</Label>
                    <p className="text-sm text-muted-foreground">Send notifications when human review is needed</p>
                  </div>
                </div>
              </div>
              
              <Button>Save AI Act Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PlatformSettingsLayout>
  );
};

export default ComplianceSettings;
