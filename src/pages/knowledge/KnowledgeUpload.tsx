
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UploadCloud, RefreshCw, X, Loader2 } from 'lucide-react';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import SourceTypeSelector from '@/components/agents/knowledge/SourceTypeSelector';
import {
  BASE_URL, getAuthHeaders, getKnowledgeBaseEndpoint, getApiUrl, API_ENDPOINTS
} from '@/utils/api-config';

interface CSVColumn {
  header: string;
  selected: boolean;
}

const KnowledgeUpload = () => {
  const [sourceType, setSourceType] = useState<"url" | "file" | "website" | "csv" | "google-drive">("file");
  const [url, setUrl] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [websiteUrls, setWebsiteUrls] = useState([""]);
  const [csvData, setCsvData] = useState<string>("");
  const [csvColumns, setCsvColumns] = useState<CSVColumn[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [googleDriveFiles, setGoogleDriveFiles] = useState<any[]>([]);
  const [selectedGoogleDriveFiles, setSelectedGoogleDriveFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageData, setPageData] = useState<{ nextToken: string; prevToken: string }>({
    nextToken: "",
    prevToken: ""
  });

  const { user } = useAuth();
  const { isGoogleDriveConnected, googleDriveError, handleGoogleDriveConnect, handleRefreshFiles } = useGoogleDrive();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleWebsiteUrlChange = (index: number, value: string) => {
    const newUrls = [...websiteUrls];
    newUrls[index] = value;
    setWebsiteUrls(newUrls);
  };

  const handleAddWebsiteUrl = () => {
    setWebsiteUrls([...websiteUrls, ""]);
  };

  const handleRemoveWebsiteUrl = (index: number) => {
    const newUrls = [...websiteUrls];
    newUrls.splice(index, 1);
    setWebsiteUrls(newUrls);
  };

  const handleCSVFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const csvText = e.target.result;
        setCsvData(csvText);
        parseCSVColumns(csvText);
      };
      reader.readAsText(file);
    }
  };

  const parseCSVColumns = (csvText: string) => {
    const lines = csvText.split('\n');
    if (lines.length > 0) {
      const headers = lines[0].split(',');
      const columns = headers.map(header => ({ header: header.trim(), selected: false }));
      setCsvColumns(columns);
    }
  };

  const toggleColumnSelection = (header: string) => {
    setSelectedColumns(prevColumns => {
      if (prevColumns.includes(header)) {
        return prevColumns.filter(col => col !== header);
      } else {
        return [...prevColumns, header];
      }
    });
  };

  const fetchGoogleDriveData = useCallback(async (token?: string) => {
    if (!user?.accessToken) return;
    
    setIsLoading(true);
    try {
      const endpoint = token ? 
        `${BASE_URL}knowledge/google-drive/?pageToken=${token}` : 
        `${BASE_URL}knowledge/google-drive/`;
      
      const response = await fetch(endpoint, {
        headers: getAuthHeaders(user.accessToken)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch Google Drive data');
      }
      
      const data = await response.json();
      setGoogleDriveFiles(data.files || []);
      
      // Update pageData state
      setPageData({
        nextToken: data.nextPageToken || "",
        prevToken: data.prevPageToken || ""
      });
      
    } catch (error) {
      console.error('Error fetching Google Drive data:', error);
      toast({
        title: "Error",
        description: "Failed to load Google Drive files",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.accessToken, toast]);

  useEffect(() => {
    if (sourceType === "google-drive" && isGoogleDriveConnected) {
      fetchGoogleDriveData();
    }
  }, [sourceType, isGoogleDriveConnected, fetchGoogleDriveData]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">Upload Knowledge</h1>
      <div className="mb-4">
        <Label htmlFor="sourceType">Select Source Type</Label>
      </div>
      
      <div className="mt-6">
        <SourceTypeSelector
          sourceType={sourceType}
          setSourceType={setSourceType}
          url={url}
          setUrl={setUrl}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          websiteUrls={websiteUrls}
          setWebsiteUrls={setWebsiteUrls}
          csvData={csvData}
          setCsvData={setCsvData}
          csvColumns={csvColumns}
          setCsvColumns={setCsvColumns}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          csvFileName={csvFileName}
          setCsvFileName={setCsvFileName}
          googleDriveFiles={googleDriveFiles}
          selectedGoogleDriveFiles={selectedGoogleDriveFiles}
          setSelectedGoogleDriveFiles={setSelectedGoogleDriveFiles}
          isGoogleDriveConnected={isGoogleDriveConnected}
          googleDriveError={googleDriveError}
          isLoading={isLoading}
          handleGoogleDriveConnect={handleGoogleDriveConnect}
          handleRefreshFiles={handleRefreshFiles}
          pageData={pageData}
        />
      </div>
    </div>
  );
};

export default KnowledgeUpload;
