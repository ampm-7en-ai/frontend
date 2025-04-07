// Function to convert file size to MB or KB format
export const formatFileSizeToMB = (size: string | number): string => {
  if (!size) return 'N/A';
  
  // If size is already a string that ends with MB or KB, return it as is
  if (typeof size === 'string' && (size.toUpperCase().endsWith('MB') || size.toUpperCase().endsWith('KB'))) {
    return size;
  }
  
  // Convert string to number if needed
  let sizeInBytes: number;
  if (typeof size === 'string') {
    // Handle strings like "1.5 KB" or "500 B"
    const match = size.match(/^([\d.]+)\s*([KMG]?B)$/i);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toUpperCase();
      
      switch (unit) {
        case 'B': sizeInBytes = value; break;
        case 'KB': sizeInBytes = value * 1024; break;
        case 'MB': return `${value} MB`; // Already in MB
        case 'GB': sizeInBytes = value * 1024 * 1024 * 1024; break;
        default: sizeInBytes = 0;
      }
    } else {
      // Try to parse as a number
      sizeInBytes = parseFloat(size);
      if (isNaN(sizeInBytes)) return 'N/A';
    }
  } else {
    sizeInBytes = size;
  }
  
  // Convert to MB with 2 decimal places
  const sizeInMB = sizeInBytes / (1024 * 1024);
  
  // Format the output - use KB for smaller files
  if (sizeInMB < 1) {
    // Show in KB if less than 1 MB
    const sizeInKB = sizeInBytes / 1024;
    return `${sizeInKB.toFixed(2)} KB`;
  } else {
    return `${sizeInMB.toFixed(2)} MB`;
  }
};

// Function to get source metadata information based on source type
export const getSourceMetadataInfo = (source: any): { count: string, size: string } => {
  const metadata = source.metadata || {};
  let count = '';
  
  if (source.type === 'plain_text' && metadata.no_of_chars) {
    count = `${metadata.no_of_chars} characters`;
  } else if (source.type === 'csv' && metadata.no_of_rows) {
    count = `${metadata.no_of_rows} rows`;
  } else if ((source.type === 'docs' || source.type === 'website' || source.type === 'pdf') && metadata.no_of_pages) {
    count = `${metadata.no_of_pages} pages`;
  }
  
  const size = metadata.file_size ? formatFileSizeToMB(metadata.file_size) : 'N/A';
  
  return { count, size };
};

// Function to convert a File to a base64 data URL (including prefix)
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Keep the complete data URL with the prefix
      const dataURL = reader.result as string;
      resolve(dataURL);
    };
    reader.onerror = error => reject(error);
  });
};
