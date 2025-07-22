
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Trash2, FileText, RotateCcw, Database, Download, CogIcon, BrushIcon, Paintbrush } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';
import { Button } from '@/components/ui/button';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import KnowledgeSourceModal from '@/components/agents/knowledge/KnowledgeSourceModal';
import { HistoryItem } from '@/types/history';

interface TestPageToolbarProps {
  selectedAgentId: string;
  onAgentChange: (agentId: string) => void;
  onClearChat: () => void;
  onViewKnowledgeSources: () => void;
  knowledgeSourceCount: number;
  agents: any[];
  isLoading: boolean;
  agent?: any;
  history?: HistoryItem[];
  chatConfigs?: any[];
  messages?: any[][];
}

export const TestPageToolbar = ({
  selectedAgentId,
  onAgentChange,
  onClearChat,
  onViewKnowledgeSources,
  knowledgeSourceCount,
  agents,
  isLoading,
  agent,
  history = [],
  chatConfigs = [],
  messages = []
}: TestPageToolbarProps) => {
  const navigate = useNavigate();
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);

  const handleViewKnowledgeSources = () => {
    setShowKnowledgeModal(true);
  };

  // Transform agents data for dropdown
  const agentOptions = agents.map(agent => ({
    value: agent.id,
    label: agent.name,
    description: `Model: ${agent.model || 'Not set'}`
  }));

  const handleExportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Model Comparison Export', 20, 20);
      
      let yPosition = 40;
      
      // Export all history items
      if (history.length > 0) {
        doc.setFontSize(14);
        doc.text('Query History', 20, yPosition);
        yPosition += 20;
        
        history.forEach((item, index) => {
          // Query
          doc.setFontSize(12);
          doc.text(`Query ${index + 1}:`, 20, yPosition);
          yPosition += 8;
          
          doc.setFontSize(10);
          const queryLines = doc.splitTextToSize(item.query, 170);
          doc.text(queryLines, 20, yPosition);
          yPosition += (queryLines.length * 5) + 10;
          
          // Responses from each model
          item.socketHistories.forEach((socketHistory) => {
            const modelName = socketHistory.queries[0]?.config?.response_model || 'Unknown Model';
            const response = socketHistory.responses[0]?.content || 'No response';
            const config = socketHistory.queries[0]?.config;
            
            doc.setFontSize(11);
            doc.text(`${modelName}:`, 30, yPosition);
            yPosition += 8;
            
            // Configuration
            if (config) {
              doc.setFontSize(9);
              doc.setTextColor(100, 100, 100);
              doc.text(`Config: Temperature=${config.temperature}, System Prompt: ${config.system_prompt?.substring(0, 50)}...`, 30, yPosition);
              yPosition += 6;
              doc.setTextColor(0, 0, 0);
            }
            
            // Response
            doc.setFontSize(10);
            const responseLines = doc.splitTextToSize(response, 160);
            doc.text(responseLines, 30, yPosition);
            yPosition += (responseLines.length * 5) + 10;
            
            // Check if we need a new page
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }
          });
          
          yPosition += 10; // Space between queries
        });
      } else {
        // Export current conversation if no history
        const conversationData = {
          query: messages[0]?.[0]?.content || '',
          responses: chatConfigs.map((config, index) => ({
            model: config.model,
            response: messages[index]?.find(msg => msg.sender?.startsWith('agent'))?.content || '',
            config: {
              temperature: config.temperature,
              maxLength: config.maxLength,
              systemPrompt: config.systemPrompt
            }
          })).filter(item => item.response)
        };

        if (conversationData.query) {
          doc.setFontSize(12);
          doc.text('Current Query:', 20, yPosition);
          yPosition += 10;
          
          doc.setFontSize(10);
          const queryLines = doc.splitTextToSize(conversationData.query, 170);
          doc.text(queryLines, 20, yPosition);
          yPosition += (queryLines.length * 5) + 20;
          
          // Add responses with configuration
          conversationData.responses.forEach((item) => {
            doc.setFontSize(12);
            doc.text(`${item.model}:`, 20, yPosition);
            yPosition += 10;
            
            // Configuration
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`Temperature: ${item.config.temperature} | Max Length: ${item.config.maxLength}`, 20, yPosition);
            yPosition += 6;
            doc.text(`System Prompt: ${item.config.systemPrompt?.substring(0, 100)}...`, 20, yPosition);
            yPosition += 8;
            doc.setTextColor(0, 0, 0);
            
            doc.setFontSize(10);
            const responseLines = doc.splitTextToSize(item.response, 170);
            doc.text(responseLines, 20, yPosition);
            yPosition += (responseLines.length * 5) + 15;
            
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }
          });
        }
      }
      
      doc.save(`model-comparison-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  const handleExportToDocx = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
      
      const children = [
        new Paragraph({
          text: "Model Comparison Export",
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({ text: "" }), // Empty line
      ];

      // Export all history items
      if (history.length > 0) {
        children.push(
          new Paragraph({
            text: "Query History",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "" })
        );
        
        history.forEach((item, index) => {
          children.push(
            new Paragraph({
              text: `Query ${index + 1}`,
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [new TextRun(item.query)],
            }),
            new Paragraph({ text: "" })
          );
          
          // Add responses from each model
          item.socketHistories.forEach((socketHistory) => {
            const modelName = socketHistory.queries[0]?.config?.response_model || 'Unknown Model';
            const response = socketHistory.responses[0]?.content || 'No response';
            const config = socketHistory.queries[0]?.config;
            
            children.push(
              new Paragraph({
                text: modelName,
                heading: HeadingLevel.HEADING_3,
              })
            );
            
            // Configuration
            if (config) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: "Configuration: ", bold: true }),
                    new TextRun(`Temperature: ${config.temperature}, System Prompt: ${config.system_prompt?.substring(0, 100)}...`)
                  ],
                })
              );
            }
            
            children.push(
              new Paragraph({
                children: [new TextRun(response)],
              }),
              new Paragraph({ text: "" })
            );
          });
        });
      } else {
        // Export current conversation if no history
        const conversationData = {
          query: messages[0]?.[0]?.content || '',
          responses: chatConfigs.map((config, index) => ({
            model: config.model,
            response: messages[index]?.find(msg => msg.sender?.startsWith('agent'))?.content || '',
            config: {
              temperature: config.temperature,
              maxLength: config.maxLength,
              systemPrompt: config.systemPrompt
            }
          })).filter(item => item.response)
        };

        if (conversationData.query) {
          children.push(
            new Paragraph({
              text: "Current Query",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [new TextRun(conversationData.query)],
            }),
            new Paragraph({ text: "" })
          );
          
          conversationData.responses.forEach((item) => {
            children.push(
              new Paragraph({
                text: item.model,
                heading: HeadingLevel.HEADING_3,
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Configuration: ", bold: true }),
                  new TextRun(`Temperature: ${item.config.temperature} | Max Length: ${item.config.maxLength} | System Prompt: ${item.config.systemPrompt?.substring(0, 100)}...`)
                ],
              }),
              new Paragraph({
                children: [new TextRun(item.response)],
              }),
              new Paragraph({ text: "" })
            );
          });
        }
      }

      const doc = new Document({
        sections: [{
          children: children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `model-comparison-${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
    }
  };

  const hasDataToExport = () => {
    return history.length > 0 || (messages.length > 0 && messages.some(msgArray => msgArray.length > 0));
  };

  return (
    <>
      <div className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shadow-sm">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <ModernButton
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/agents')}
          >
            Back
          </ModernButton>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Agent Playground
            </span>
          </div>
        </div>

        {/* Center Section - Agent Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Testing:</span>
            <ModernDropdown
              value={selectedAgentId}
              onValueChange={onAgentChange}
              options={agentOptions}
              placeholder={isLoading ? "Loading..." : "Select an agent"}
              className="w-48"
              disabled={isLoading}
            />
          </div>

          {agent && knowledgeSourceCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewKnowledgeSources}
                  className="h-8 px-2"
                >
                  <Database className="h-4 w-4" />
                  <span className="ml-1 text-xs">{knowledgeSourceCount}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View {knowledgeSourceCount} knowledge sources</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ModernButton
                variant="ghost"
                size="sm"
                icon={Download}
                disabled={!hasDataToExport()}
              >
                Export
              </ModernButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportToPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportToDocx}>
                <FileText className="h-4 w-4 mr-2" />
                Export as DOCX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ModernButton
            variant="ghost"
            size="sm"
            icon={Paintbrush}
            onClick={onClearChat}
          >
            Clear Cell
          </ModernButton>
          
          <ModernButton
            variant="gradient"
            size="sm"
            icon={CogIcon}
            onClick={() => navigate(`/agents/builder/${selectedAgentId}`)}
          >
            Builder
          </ModernButton>
        </div>
      </div>

      {/* Knowledge Source Modal */}
      {agent && (
        <KnowledgeSourceModal
          open={showKnowledgeModal}
          onOpenChange={setShowKnowledgeModal}
          sources={agent.knowledgeSources || []}
          initialSourceId={null}
          agentId={selectedAgentId}
        />
      )}
    </>
  );
};
