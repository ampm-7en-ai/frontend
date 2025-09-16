// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { Icon } from '../icons';

interface SatisfactionBreakdownCardProps {
  positive?: number;
  neutral?: number;
  negative?: number;
}

const SatisfactionBreakdownCard: React.FC<SatisfactionBreakdownCardProps> = ({
  positive = 85,
  neutral = 12,
  negative = 3
}) => {
  return (
    <Card className="bg-white dark:bg-neutral-800/60 border-0 rounded-lg shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between flex-row-reverse gap-2 pl-0">
          <Icon type='plain' name='Like' className='h-5 w-5 text-muted-foreground' color='hsl(var(--foreground))' />
          Customer satisfaction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">All over satisfaction</p>
        
        <div className="flex justify-around items-center pt-6">
          {/* Positive */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19.1436" cy="19.1436" r="18.3645" className='stroke-foreground' stroke-width="1.5582"/>
                <mask id="path-2-inside-1_60_382" fill="white">
                <path d="M28.4928 21.8148C28.4928 24.2519 27.5412 26.5926 25.8407 28.3383C24.1402 30.0841 21.8253 31.0968 19.389 31.1608C16.9528 31.2247 14.5879 30.3349 12.7981 28.6808C11.0084 27.0268 9.9352 24.7392 9.80729 22.3055L11.5987 22.2114C11.702 24.1781 12.5693 26.0267 14.0157 27.3634C15.462 28.7001 17.3732 29.4192 19.3419 29.3675C21.3107 29.3158 23.1815 28.4974 24.5557 27.0866C25.9299 25.6759 26.6989 23.7843 26.6989 21.8148H28.4928Z"/>
                </mask>
                <path d="M28.4928 21.8148C28.4928 24.2519 27.5412 26.5926 25.8407 28.3383C24.1402 30.0841 21.8253 31.0968 19.389 31.1608C16.9528 31.2247 14.5879 30.3349 12.7981 28.6808C11.0084 27.0268 9.9352 24.7392 9.80729 22.3055L11.5987 22.2114C11.702 24.1781 12.5693 26.0267 14.0157 27.3634C15.462 28.7001 17.3732 29.4192 19.3419 29.3675C21.3107 29.3158 23.1815 28.4974 24.5557 27.0866C25.9299 25.6759 26.6989 23.7843 26.6989 21.8148H28.4928Z" className='stroke-foreground' stroke-width="3.1164" mask="url(#path-2-inside-1_60_382)"/>
                <circle cx="12.5769" cy="13.9125" r="1.8921" className='fill-foreground'/>
                <circle cx="25.8215" cy="13.9125" r="1.8921" className='fill-foreground'/>
              </svg>

            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Positive</div>
              <div className="text-lg font-semibold text-foreground">{positive}%</div>
            </div>
          </div>

          {/* Neutral */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="19.1436" cy="19.1436" r="18.3645" className='stroke-foreground' stroke-width="1.5582"/>
              <circle cx="12.5769" cy="13.9125" r="1.8921" className='fill-foreground'/>
              <circle cx="25.8216" cy="13.9125" r="1.8921" className='fill-foreground'/>
              <line x1="10.6848" y1="25.3207" x2="27.7137" y2="25.3207" className='stroke-foreground' stroke-width="2.7825"/>
              </svg>

            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Neutral</div>
              <div className="text-lg font-semibold text-foreground">{neutral}%</div>
            </div>
          </div>

          {/* Negative */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full flex items-end justify-center">
              <svg width="39" height="42" viewBox="0 0 39 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="19.1436" cy="19.1436" r="18.3645" className='stroke-foreground' stroke-width="1.5582"/>
              <mask id="path-2-inside-1_60_396" fill="white">
              <path d="M10.8169 28.915C11.1923 26.7244 12.3358 24.7391 14.0424 23.3153C15.7489 21.8914 17.9069 21.1221 20.1293 21.1453C22.3517 21.1685 24.4932 21.9826 26.1697 23.4417C27.8462 24.9009 28.948 26.9095 29.2776 29.1075L27.5036 29.3735C27.2373 27.5973 26.3468 25.974 24.992 24.7949C23.6372 23.6157 21.9066 22.9578 20.1106 22.939C18.3146 22.9203 16.5707 23.542 15.1916 24.6927C13.8124 25.8433 12.8884 27.4476 12.585 29.2179L10.8169 28.915Z"/>
              </mask>
              <path d="M10.8169 28.915C11.1923 26.7244 12.3358 24.7391 14.0424 23.3153C15.7489 21.8914 17.9069 21.1221 20.1293 21.1453C22.3517 21.1685 24.4932 21.9826 26.1697 23.4417C27.8462 24.9009 28.948 26.9095 29.2776 29.1075L27.5036 29.3735C27.2373 27.5973 26.3468 25.974 24.992 24.7949C23.6372 23.6157 21.9066 22.9578 20.1106 22.939C18.3146 22.9203 16.5707 23.542 15.1916 24.6927C13.8124 25.8433 12.8884 27.4476 12.585 29.2179L10.8169 28.915Z" className='stroke-foreground' stroke-width="3.1164" mask="url(#path-2-inside-1_60_396)"/>
              <circle cx="12.577" cy="13.9125" r="1.8921" className='fill-foreground'/>
              <circle cx="25.8217" cy="13.9125" r="1.8921" className='fill-foreground'/>
              </svg>

            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Negative</div>
              <div className="text-lg font-semibold text-foreground">{negative}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SatisfactionBreakdownCard;