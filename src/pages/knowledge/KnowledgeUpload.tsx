import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadedFiles } from '@/components/knowledge/UploadedFiles';
import { UploadedFile } from '@/types/knowledge';
import { WebsiteInput } from '@/components/knowledge/WebsiteInput';
import { DocumentUpload } from '@/components/knowledge/DocumentUpload';
import { PlainTextInput } from '@/components/knowledge/PlainTextInput';
import { SpreadsheetUpload } from '@/components/knowledge/SpreadsheetUpload';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createKnowledgeBase, addFileToKnowledgeBase } from '@/utils/api';

// ... keep existing code
