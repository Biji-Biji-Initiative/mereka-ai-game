import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useRivalStore } from '@/store/rival-store';
import { useBadgeStore } from '@/store/badge-store';
import { useLeaderboardStore } from '@/store/leaderboard-store';
import { useNetworkStore } from '@/store/network-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RivalCard } from '@/components/rival/RivalCard';
import { BadgeCollection } from '@/components/badges/BadgeCollection';
import { LeaderboardDisplay } from '@/components/leaderboard/LeaderboardDisplay';
import { NetworkVisualization } from '@/components/network/NetworkVisualization';
import { NetworkStatsDisplay } from '@/components/network/NetworkStatsDisplay';

interface ProfilePageProps {
  userId?: string;
}

export function ProfilePage({ userId = 'current-user' }: ProfilePageProps) {
  // Get game state
  const { responses, focus } = useGameStore();
  
  // Get rival state
  const currentRival = useRivalStore(state => state.currentRival);
  
  // Get badge state
  const badgeCollection = useBadgeStore(state => state.badgeCollection);
  
  // Get network state
  const network = useNetworkStore(state => state.network);
  const stats = useNetworkStore(state => state.stats);
  const visualizationMode = useNetworkStore(state => state.visualizationMode);
  const selectedNodeId = useNetworkStore(state => state.selectedNodeId);
  const setVisualizationMode = useNetworkStore(state => state.setVisualizationMode);
  const selectNode = useNetworkStore(state => state.selectNode);
  
  // Helper function to count completed rounds
  const getCompletedRoundsCount = () => {
    let count = 0;
    if (responses.round1?.userResponse) count++;
    if (responses.round2?.userResponse) count++;
    if (responses.round3?.userResponse) count++;
    return count;
  };
  
  return (
    <div className="profile-page">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold neon-text">Your Profile</CardTitle>
          <CardDescription>
            Track your progress, achievements, and cognitive development
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rival">AI Rival</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          <TabsTrigger value="network">Neural Network</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="user-avatar mr-4">
                      <div className="user-avatar-inner">
                        <div className="user-avatar-placeholder">
                          {userId.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">User {userId}</h3>
                      <p className="text-muted-foreground">
                        Joined {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="stats-grid grid grid-cols-2 gap-3">
                    <div className="stat-card glass p-3 rounded-lg">
                      <div className="stat-value text-2xl font-bold">
                        {badgeCollection?.totalUnlocked || 0}
                      </div>
                      <div className="stat-label text-sm text-muted-foreground">
                        Badges Earned
                      </div>
                    </div>
                    
                    <div className="stat-card glass p-3 rounded-lg">
                      <div className="stat-value text-2xl font-bold">
                        {network?.overallLevel || 1}
                      </div>
                      <div className="stat-label text-sm text-muted-foreground">
                        Network Level
                      </div>
                    </div>
                    
                    <div className="stat-card glass p-3 rounded-lg">
                      <div className="stat-value text-2xl font-bold">
                        {getCompletedRoundsCount()}
                      </div>
                      <div className="stat-label text-sm text-muted-foreground">
                        Rounds Completed
                      </div>
                    </div>
                    
                    <div className="stat-card glass p-3 rounded-lg">
                      <div className="stat-value text-2xl font-bold">
                        {stats?.dominantDomain ? stats.dominantDomain.charAt(0).toUpperCase() + stats.dominantDomain.slice(1) : 'None'}
                      </div>
                      <div className="stat-label text-sm text-muted-foreground">
                        Dominant Domain
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(responses || {}).length > 0 ? (
                    <div className="recent-rounds space-y-3">
                      {Object.entries(responses || {})
                        .filter(([round, response]) => response?.userResponse)
                        .map(([round, response]) => (
                          <div key={round} className="round-result glass p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">
                                  {round === 'round1' ? 'Round 1' : 
                                   round === 'round2' ? 'Round 2' : 'Round 3'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date().toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold">85%</div>
                                <div className="text-sm text-muted-foreground">
                                  {response?.userResponse ? 'Completed' : 'In Progress'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <p>No activity recorded yet. Complete challenges to see your progress!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Badges */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Badges</CardTitle>
              </CardHeader>
              <CardContent>
                {badgeCollection?.unlockedBadges.length ? (
                  <div className="grid grid-cols-2 gap-3">
                    {badgeCollection.unlockedBadges
                      .sort((a, b) => {
                        const aTime = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
                        const bTime = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
                        return bTime - aTime;
                      })
                      .slice(0, 4)
                      .map(badge => (
                        <div key={badge.id} className="badge-preview glass p-3 rounded-lg">
                          <div className="flex items-center">
                            <div className="badge-icon-small mr-3">{badge.icon}</div>
                            <div>
                              <h4 className="font-medium text-sm">{badge.name}</h4>
                              <p className="text-xs text-muted-foreground">{badge.tier}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <p>No badges earned yet. Complete challenges to earn badges!</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* AI Rival Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Your AI Rival</CardTitle>
              </CardHeader>
              <CardContent>
                {currentRival ? (
                  <div className="rival-preview glass p-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="rival-avatar-small mr-3">
                        {currentRival.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{currentRival.name}</h4>
                        <p className="text-sm text-muted-foreground">{currentRival.personalityType}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm">{currentRival.description.substring(0, 100)}...</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <p>No rival generated yet. Complete the assessment to generate your AI rival!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* AI Rival Tab */}
        <TabsContent value="rival">
          {currentRival ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <RivalCard 
                  rival={currentRival} 
                  showPerformance={true} 
                  showComparison={true} 
                />
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Rivalry History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(responses || {}).length > 0 && currentRival.performance ? (
                      <div className="space-y-4">
                        {['round1', 'round2', 'round3'].map((round, index) => {
                          const roundKey = round as keyof typeof currentRival.performance;
                          const userScore = responses[round as keyof typeof responses]?.userResponse ? 85 : undefined;
                          const rivalScore = currentRival.performance[roundKey];
                          
                          if (userScore === undefined || rivalScore === undefined) {
                            return null;
                          }
                          
                          const userWon = userScore > rivalScore;
                          const tie = userScore === rivalScore;
                          
                          return (
                            <div key={round} className="round-comparison glass p-3 rounded-lg">
                              <h4 className="font-medium mb-2">Round {index + 1}</h4>
                              
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-center">
                                  <div className="text-xl font-bold">{userScore}%</div>
                                  <div className="text-sm text-muted-foreground">Your Score</div>
                                </div>
                                
                                <div className="comparison-indicator">
                                  {userWon ? (
                                    <span className="text-green-500">+{userScore - rivalScore}%</span>
                                  ) : tie ? (
                                    <span className="text-yellow-500">Tie</span>
                                  ) : (
                                    <span className="text-red-500">{userScore - rivalScore}%</span>
                                  )}
                                </div>
                                
                                <div className="text-center">
                                  <div className="text-xl font-bold">{rivalScore}%</div>
                                  <div className="text-sm text-muted-foreground">Rival Score</div>
                                </div>
                              </div>
                              
                              <div className="comparison-bar">
                                <div 
                                  className="user-score-fill"
                                  style={{width: `${userScore}%`}}
                                ></div>
                                <div 
                                  className="rival-score-fill"
                                  style={{width: `${rivalScore}%`}}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <p>No rivalry history yet. Complete challenges to build your rivalry!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Rival Traits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentRival.traits.map((trait) => (
                        <div key={trait.id} className="trait-comparison">
                          <div className="trait-header">
                            <h4 className="trait-name capitalize">{trait.name}</h4>
                            <div className="trait-score">{trait.value}/5</div>
                          </div>
                          <div className="trait-meter">
                            <div 
                              className={`trait-meter-fill ${trait.comparison}`}
                              style={{width: `${(trait.value / 5) * 100}%`}}
                            ></div>
                          </div>
                          <p className="trait-manifestation text-sm">{trait.manifestation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p>No rival generated yet. Complete the assessment to generate your AI rival!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Badges Tab */}
        <TabsContent value="badges">
          {badgeCollection ? (
            <BadgeCollection 
              unlockedBadges={badgeCollection.unlockedBadges} 
              inProgressBadges={badgeCollection.inProgressBadges} 
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p>No badges available yet. Complete challenges to earn badges!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Leaderboards Tab */}
        <TabsContent value="leaderboards">
          <div className="space-y-6">
            <LeaderboardDisplay 
              initialType="global"
              initialTimeframe="all_time"
              maxEntries={10}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LeaderboardDisplay 
                initialType="similar"
                initialTimeframe="monthly"
                maxEntries={5}
              />
              
              <LeaderboardDisplay 
                initialType="focus"
                initialTimeframe="weekly"
                maxEntries={5}
                focusArea={focus?.id}
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Neural Network Tab */}
        <TabsContent value="network">
          {network && stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Neural Network Visualization</CardTitle>
                    <CardDescription>
                      Level {network.overallLevel} Network • {stats.unlockedNodes} Nodes • {stats.activeConnections} Connections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <NetworkVisualization 
                      network={network}
                      selectedNodeId={selectedNodeId}
                      visualizationMode={visualizationMode}
                      onNodeSelect={selectNode}
                      width={600}
                      height={500}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <NetworkStatsDisplay stats={stats} />
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p>No neural network data available yet. Complete challenges to develop your network!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
