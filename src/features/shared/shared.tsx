import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGameStore } from '@/store/useGameStore'

export interface SharedProps {
  profileId?: string
  onViewMore: () => void
}

export function Shared({ profileId, onViewMore }: SharedProps) {
  const { personality, focus, responses } = useGameStore()
  const [copied, setCopied] = React.useState(false)
  const [shareUrl, setShareUrl] = React.useState('')
  
  // Generate a shareable URL
  React.useEffect(() => {
    // In a real app, this would be a proper URL with the profile ID
    const generatedUrl = `https://ai-fight-club.example.com/profile/${profileId || 'demo'}`
    setShareUrl(generatedUrl)
  }, [profileId])
  
  // Calculate final score from responses
  const calculateFinalScore = () => {
    let total = 0
    let rounds = 0
    
    if (responses.round1?.analysis) {
      total += 85 // Example score
      rounds++
    }
    
    if (responses.round2?.analysis) {
      total += 90 // Example score
      rounds++
    }
    
    if (responses.round3?.analysis) {
      total += 95 // Example score
      rounds++
    }
    
    return rounds > 0 ? Math.floor(total / rounds) : 0
  }
  
  const displayScore = calculateFinalScore()
  
  // Generate profile summary based on traits and focus
  const generateProfileSummary = () => {
    if (!personality?.traits?.length || !focus) {
      return "This is a sample AI personality profile. Complete the game to generate your own profile!"
    }
    
    const highestTrait = [...personality.traits].sort((a, b) => b.value - a.value)[0]
    const lowestTrait = [...personality.traits].sort((a, b) => a.value - b.value)[0]
    
    return `This AI personality profile shows a strong ${highestTrait?.name} trait, while the ${lowestTrait?.name} trait is less dominant. The focus was on ${focus?.name} during the challenges with a final score of ${displayScore}/100.`
  }
  
  const profileSummary = generateProfileSummary()
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  
  const handleShareTwitter = () => {
    const text = `Check out my AI Fight Club personality profile! I scored ${displayScore}/100. ${shareUrl}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }
  
  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">AI Personality Profile</CardTitle>
          <CardDescription className="mt-2">
            {profileId ? 'Share your results with others' : 'View a shared AI personality profile'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
            <h3 className="text-xl font-semibold mb-2">AI Compatibility Score</h3>
            <div className="text-5xl font-bold">{displayScore}/100</div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Profile Summary</h3>
            <p className="text-lg">{profileSummary}</p>
          </div>
          
          {personality?.traits?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Trait Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personality.traits.map((trait) => (
                  <div key={trait.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{trait.name}</span>
                      <span className="font-bold">{trait.value}/10</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${(trait.value / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {profileId && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Share Your Profile</h3>
              <div className="flex flex-col space-y-4">
                <div>
                  <Label htmlFor="share-url">Profile Link</Label>
                  <div className="flex mt-1">
                    <Input 
                      id="share-url"
                      value={shareUrl}
                      readOnly
                      className="flex-1 rounded-r-none"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className="rounded-l-none"
                      variant="secondary"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleShareTwitter}
                  >
                    Share on Twitter
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleShareFacebook}
                  >
                    Share on Facebook
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button onClick={onViewMore}>
            {profileId ? 'Back to Results' : 'Try the AI Fight Club'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
