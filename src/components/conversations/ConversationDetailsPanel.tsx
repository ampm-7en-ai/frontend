
import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, MessageSquare, User, Star, TrendingUp, Phone, Mail, MapPin, Calendar, Tag, Plus, Ticket, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import HandoffHistory from './HandoffHistory';
import CreateSupportTicketModal from './CreateSupportTicketModal';
import { analyzeSentiment } from '@/lib/sentiment';
import SentimentJourneyChart from './SentimentJourneyChart';
import { Icon } from '../icons';

interface ConversationDetailsPanelProps {
  conversation: any;
  selectedAgent: string | null;
  onHandoffClick: (handoff: any) => void;
  getSatisfactionIndicator: (satisfaction: string) => React.ReactNode;
  sentimentData: {  
    sentimentScores: Array<{
      messageId: string;
      content: string;
      score: number;
      timestamp: string;
    }>;
    averageSentiment: number | null;
  };
  feedback?: any;
}

const ConversationDetailsPanel = ({ 
  conversation, 
  selectedAgent, 
  onHandoffClick, 
  getSatisfactionIndicator ,
  sentimentData,
  feedback
}: ConversationDetailsPanelProps) => {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const { sentimentScores, averageSentiment } = sentimentData;
  const scores = sentimentScores.map(item => item.score);
  const {weightedAverage, sentimentCategory, movingAverages, trend } = analyzeSentiment(scores);

  // Extract real handoff data from messages
  const handoffData = useMemo(() => {
    // Add proper null checks to prevent errors
    if (!conversation?.messages || !Array.isArray(conversation.messages) || conversation.messages.length === 0) {
      return { handoffs: [], currentAgent: 'AI Assistant', allAgents: ['AI Assistant'] };
    }

    const agents = new Set<string>();
    const handoffs: any[] = [];
    let previousAgent = 'AI Assistant';
    
    // Add initial AI agent
    agents.add('AI Assistant');

    // Go through messages to find agent changes
    conversation.messages.forEach((message: any, index: number) => {
      if (!message) return; // Skip null/undefined messages
      
      const currentAgent = message.agent || (message.sender === 'user' ? null : 'AI Assistant');


      
      if (currentAgent && currentAgent !== previousAgent) {
        agents.add(currentAgent);
        
        handoffs.push({
          id: `handoff_${index}`,
          from: previousAgent,
          to: currentAgent,
          timestamp: message.timestamp || new Date().toISOString(),
          reason: `Agent change detected in message flow`
        });
        
        previousAgent = currentAgent;
      }
    });

    // Get the current agent from the conversation object or last message
    const currentAgent = conversation.agent || conversation.assignedAgent || handoffData?.currentAgent || 'AI Assistant';
    if (currentAgent) {
      agents.add(currentAgent);
    }

    return { 
      handoffs, 
      currentAgent,
      allAgents: Array.from(agents)
    };
  }, [conversation?.messages, conversation?.agent, conversation?.assignedAgent]);

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'Frustrated':
        return (
         <svg width="39" height="42" viewBox="0 0 39 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="19.1436" cy="19.1436" r="18.3645" className='stroke-foreground' stroke-width="1.5582"/>
          <mask id="path-2-inside-1_60_396" fill="white">
          <path d="M10.8169 28.915C11.1923 26.7244 12.3358 24.7391 14.0424 23.3153C15.7489 21.8914 17.9069 21.1221 20.1293 21.1453C22.3517 21.1685 24.4932 21.9826 26.1697 23.4417C27.8462 24.9009 28.948 26.9095 29.2776 29.1075L27.5036 29.3735C27.2373 27.5973 26.3468 25.974 24.992 24.7949C23.6372 23.6157 21.9066 22.9578 20.1106 22.939C18.3146 22.9203 16.5707 23.542 15.1916 24.6927C13.8124 25.8433 12.8884 27.4476 12.585 29.2179L10.8169 28.915Z"/>
          </mask>
          <path d="M10.8169 28.915C11.1923 26.7244 12.3358 24.7391 14.0424 23.3153C15.7489 21.8914 17.9069 21.1221 20.1293 21.1453C22.3517 21.1685 24.4932 21.9826 26.1697 23.4417C27.8462 24.9009 28.948 26.9095 29.2776 29.1075L27.5036 29.3735C27.2373 27.5973 26.3468 25.974 24.992 24.7949C23.6372 23.6157 21.9066 22.9578 20.1106 22.939C18.3146 22.9203 16.5707 23.542 15.1916 24.6927C13.8124 25.8433 12.8884 27.4476 12.585 29.2179L10.8169 28.915Z" className='stroke-foreground' stroke-width="3.1164" mask="url(#path-2-inside-1_60_396)"/>
          <circle cx="12.577" cy="13.9125" r="1.8921" className='fill-foreground'/>
          <circle cx="25.8217" cy="13.9125" r="1.8921" className='fill-foreground'/>
          </svg>
        );
      case 'Satisfied':
        return (
          <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="19.1436" cy="19.1436" r="18.3645" className='stroke-foreground' stroke-width="1.5582"/>
            <mask id="path-2-inside-1_60_382" fill="white">
            <path d="M28.4928 21.8148C28.4928 24.2519 27.5412 26.5926 25.8407 28.3383C24.1402 30.0841 21.8253 31.0968 19.389 31.1608C16.9528 31.2247 14.5879 30.3349 12.7981 28.6808C11.0084 27.0268 9.9352 24.7392 9.80729 22.3055L11.5987 22.2114C11.702 24.1781 12.5693 26.0267 14.0157 27.3634C15.462 28.7001 17.3732 29.4192 19.3419 29.3675C21.3107 29.3158 23.1815 28.4974 24.5557 27.0866C25.9299 25.6759 26.6989 23.7843 26.6989 21.8148H28.4928Z"/>
            </mask>
            <path d="M28.4928 21.8148C28.4928 24.2519 27.5412 26.5926 25.8407 28.3383C24.1402 30.0841 21.8253 31.0968 19.389 31.1608C16.9528 31.2247 14.5879 30.3349 12.7981 28.6808C11.0084 27.0268 9.9352 24.7392 9.80729 22.3055L11.5987 22.2114C11.702 24.1781 12.5693 26.0267 14.0157 27.3634C15.462 28.7001 17.3732 29.4192 19.3419 29.3675C21.3107 29.3158 23.1815 28.4974 24.5557 27.0866C25.9299 25.6759 26.6989 23.7843 26.6989 21.8148H28.4928Z" className='stroke-foreground' stroke-width="3.1164" mask="url(#path-2-inside-1_60_382)"/>
            <circle cx="12.5769" cy="13.9125" r="1.8921" className='fill-foreground'/>
            <circle cx="25.8215" cy="13.9125" r="1.8921" className='fill-foreground'/>
          </svg>
        );
      case 'Neutral':
      default:
        return (
           <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="19.1436" cy="19.1436" r="18.3645" className='stroke-foreground' stroke-width="1.5582"/>
          <circle cx="12.5769" cy="13.9125" r="1.8921" className='fill-foreground'/>
          <circle cx="25.8216" cy="13.9125" r="1.8921" className='fill-foreground'/>
          <line x1="10.6848" y1="25.3207" x2="27.7137" y2="25.3207" className='stroke-foreground' stroke-width="2.7825"/>
          </svg>
        );
    }
  };

  // Check if satisfaction data exists and is not empty
  const hasSatisfactionData = conversation?.satisfaction && conversation.satisfaction.trim() !== '';
  
  // Check if ticketing should be disabled (for human agents)
  const isTicketingDisabled = conversation?.agentType === 'human';

  // Check if ticket information exists
  const hasTicketInfo = conversation?.ticket_by && conversation?.ticket_id;

  if (!conversation) {
    return (
      <div className="h-full bg-white/80 dark:bg-[hsla(0,0%,0%,0.95)] backdrop-blur-sm p-3 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-transparent flex items-center justify-center">
             <Icon name="Playground" type='plain' color='hsl(var(--muted))' />
          </div>
          {/* <h3 className="text-xs font-medium text-foreground dark:text-neutral-100 mb-1">No conversation selected</h3>
          <p className="text-[10px] text-gray-500 dark:text-neutral-400">Select a conversation to view details</p> */}
        </div>
      </div>
    );
  }

  // Get the real assigned agent from conversation data
  const assignedAgent = conversation.agent || conversation.assignedAgent || handoffData.currentAgent;

  //logo
  const getTicketLogo = (provider: string) => {
    const logos = {
      hubspot: 'https://img.logo.dev/hubspot.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      zendesk: 'https://img.logo.dev/zendesk.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      freshdesk: 'https://img.logo.dev/freshworks.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      jira: 'https://img.logo.dev/atlassian.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true',
      servicenow: 'https://img.logo.dev/servicenow.com?token=pk_PBSGl-BqSUiMKphvlyXrGA&retina=true'
    };
    
    return logos[provider.toLowerCase() as keyof typeof logos] || null;
  };

  const logoUrl = getTicketLogo(conversation.ticket_by);

  // Transform data for Recharts
  const chartData = scores.map((score, index) => ({
    index: index + 1,
    score: score,
    movingAverage: index >= 2 ? movingAverages[index - 2] : null
  }));


  return (
    <div className="h-full bg-white/80 dark:bg-[hsla(0,0%,0%,0.95)] backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-neutral-700/50 bg-white/50 dark:bg-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Information</h1>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-80px)]">
        <div className="p-4 space-y-4">
          {/* Ticket Information Section - Show if ticket info exists */}
          {hasTicketInfo && (
            
            <div className="border rounded-lg bg-white dark:bg-neutral-800 dark:border-0 px-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${logoUrl ? "p-0" : "p-2"} rounded-xl bg-gradient-to-br from-red-500 to-red-600`}>
                  {
                    logoUrl ? (
                      <img 
                      src={logoUrl} 
                      alt={`${conversation.ticket_by} logo`} 
                      className="h-8 w-8 rounded-xl"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    ) : (
                    <Ticket className="h-4 w-4 text-white" />
                  )
                  }
                  
                </div>
                <div>
                  <h3 className="font-semibold text-foreground dark:text-foreground">Ticket Information</h3>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-foreground dark:text-foreground mb-1 flex items-center gap-2 text-sm">
                    Provider
                  </h4>
                  <p className="text-muted-foreground dark:text-gray-400 text-sm capitalize">{conversation.ticket_by}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground dark:text-foreground mb-1 text-sm">Ticket ID</h4>
                  <p className="text-muted-foreground dark:text-muted-foreground text-sm font-mono">{conversation.ticket_id}</p>
                </div>
              </div>
            </div>

          )}

          {/* Agent Information Section */}
          <div className="border rounded-lg bg-white dark:bg-neutral-800 dark:border-0 px-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-transparent">
                <Icon type='plain' color='hsl(var(--primary))' name={`Magic`} className='h-5 w-5' />
              </div>
              <div>
                <h3 className="font-semibold text-foreground dark:text-foreground">Agent Info</h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <p className="font-normal text-foreground dark:text-foreground">{assignedAgent}</p>
              </div>
            </div>

            
          </div>

          {/* Customer Information */}
          <div className="border rounded-lg bg-white dark:bg-neutral-800 dark:border-0 px-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-transparent">
                <Icon type='plain' color='hsl(var(--primary))' name={`Person`} className='h-5 w-5' />
              </div>
              <div>
                <h3 className="font-semibold text-foreground dark:text-foreground">Customer Info</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-foreground dark:text-foreground mb-1 text-sm">Full Name</h4>
                <p className="text-muted-foreground dark:text-muted-foreground text-sm">{conversation.customer || "Visitor"}</p>
              </div>
              
              {conversation.email && (
                <div>
                  <h4 className="font-medium text-foreground dark:text-foreground mb-1 flex items-center gap-2 text-sm">
                    Email
                  </h4>
                  <p className="text-muted-foreground dark:text-muted-foreground text-sm">{conversation.email}</p>
                </div>
              )}
              
              {hasSatisfactionData && (
                <div>
                  <h4 className="font-medium text-foreground dark:text-foreground mb-2 flex items-center gap-2 text-sm">
              
                    Satisfaction
                  </h4>
                  <div>{getSentimentEmoji(sentimentCategory)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Sentiment - Only show if satisfaction data exists */}
          {hasSatisfactionData && (
            <div className="border rounded-lg bg-white dark:bg-neutral-800 dark:border-0 px-4 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-transparent">
                    <Icon type='plain' color='hsl(var(--primary))' name={`Chart`} className='h-5 w-5' />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground dark:text-foreground">Sentiment Journey</h3>
                    <p className="text-xs text-muted-foreground">Conversation mood over time</p>
                  </div>
                </div>

                <div className="w-full">
                  <SentimentJourneyChart 
                    chartData={chartData}
                    height={220}
                  />
                </div>
            </div>
          )}

          {/* Customer Feedback */}
          { feedback[0]?.text !== undefined && feedback[0]?.rating !== undefined && (
            <div className="border rounded-lg bg-white dark:bg-neutral-800 dark:border-0 px-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-transparent">
                <Icon type='plain' color='hsl(var(--primary))' name={`Ratings`} className='h-5 w-5' />
              </div>
              <div>
                <h3 className="font-semibold text-foreground dark:text-foreground">Customer Feedback</h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>
                {/* Star Rating */}
                <div>
                  <div className="flex justify-start gap-1">
                  {Array.from({ length: feedback[0].rating}, (_, i) => i + 1).map((star) => (
                    
                        <Star key={star} size={18} className='fill-yellow-400 stroke-none' />
                      
                    ))}
                    <span className='text-xs'>({feedback[0].rating}/5)</span>
                  </div>
                 {
                  feedback[0].text !== undefined && (
                     <blockquote className='font-light text-sm' style={{fontStyle: "italic"}}>
                      "{feedback[0].text}"
                    </blockquote>
                  )
                 }
                </div>
              </div>
            </div>
          </div>
          )
            
          }

          {/* Handoff History - Only show if there are handoffs */}
          {handoffData.handoffs.length > 0 && (
            <div className="border rounded-lg bg-white dark:bg-neutral-800 dark:border-0 px-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-transparent">
                  <Icon type='plain' color='hsl(var(--primary))' name={`Users`} className='h-5 w-5' />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground dark:text-foreground">Agent Handoffs</h3>
                </div>
              </div>

              <HandoffHistory 
                handoffs={handoffData.handoffs}
                onHandoffClick={onHandoffClick}
              />
            </div>
          )}

          {/* All Agents Section */}
          {handoffData.allAgents.length > 1 && (
            <div className="border rounded-lg bg-white dark:bg-neutral-800 dark:border-0 px-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-transparent">
                  <Icon type='plain' color='hsl(var(--primary))' name={`Transaction`} className='h-5 w-5' />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground dark:text-foreground">All Agents</h3>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {handoffData.allAgents.map((agent, index) => (
                  <Badge 
                    key={index}
                    variant={agent === handoffData.currentAgent ? "default" : "outline"}
                    className="text-sm"
                  >
                    {agent}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Support Ticket Modal */}
      <CreateSupportTicketModal
        open={isTicketModalOpen}
        onOpenChange={setIsTicketModalOpen}
        conversation={conversation}
      />
    </div>
  );
};

export default ConversationDetailsPanel;
