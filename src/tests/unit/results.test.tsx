import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Results } from '@/features/results/results';

// Mock the useGameStore hook
vi.mock('@/store/game-store', () => ({
  useGameStore: () => ({
    traits: [
      { id: 'autonomy', name: 'autonomy', score: 4, description: 'Your autonomy score indicates how you interact with AI systems.' },
      { id: 'transparency', name: 'transparency', score: 3, description: 'Your transparency score indicates how you interact with AI systems.' },
      { id: 'privacy', name: 'privacy', score: 5, description: 'Your privacy score indicates how you interact with AI systems.' },
    ],
    selectedFocus: { id: 'creative', name: 'Creative Thinking', description: 'Test your creative problem-solving abilities against AI systems.', selected: true },
    roundResults: {
      round1: { completed: true, score: 75, timeRemaining: 30, timeExpired: false },
      round2: { completed: true, score: 85, timeRemaining: 25, timeExpired: false },
      round3: { completed: true, score: 65, timeRemaining: 15, timeExpired: false },
    },
    resetGame: vi.fn(),
  }),
}));

// Mock the useGameLogger hook
vi.mock('@/hooks/useGameLogger', () => ({
  useGameLogger: () => ({
    logGameEvent: vi.fn(),
    logUserInteraction: vi.fn(),
  }),
}));

describe('Results Component', () => {
  let onShareMock: ReturnType<typeof vi.fn>;
  let onRestartMock: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    onShareMock = vi.fn();
    onRestartMock = vi.fn();
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('renders the results screen correctly', () => {
    render(<Results onShare={onShareMock} onRestart={onRestartMock} />);
    
    // Check for main title
    expect(screen.getByText('Results Analysis')).toBeInTheDocument();
    
    // Check for profile
    expect(screen.getByText('Digital Innovator')).toBeInTheDocument();
    
    // Check for overall score (75 + 85 + 65) / 3 = 75
    expect(screen.getByText('75')).toBeInTheDocument();
    
    // Check for focus area
    expect(screen.getByText('Creative Thinking')).toBeInTheDocument();
    
    // Check for trait analysis
    expect(screen.getByText('autonomy')).toBeInTheDocument();
    expect(screen.getByText('transparency')).toBeInTheDocument();
    expect(screen.getByText('privacy')).toBeInTheDocument();
    
    // Check for round performance
    expect(screen.getAllByText(/Round \d/i).length).toBe(3);
    
    // Check for action buttons
    expect(screen.getByRole('button', { name: /Share Your Results/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start New Challenge/i })).toBeInTheDocument();
  });
  
  it('calls onShare when the Share button is clicked', async () => {
    render(<Results onShare={onShareMock} onRestart={onRestartMock} />);
    
    // Find and click the Share button
    const shareButton = screen.getByRole('button', { name: /Share Your Results/i });
    fireEvent.click(shareButton);
    
    // Advance timers to trigger the timeout
    vi.advanceTimersByTime(600);
    
    // Check if onShare was called
    expect(onShareMock).toHaveBeenCalledTimes(1);
  });
  
  it('calls onRestart when the Restart button is clicked', async () => {
    render(<Results onShare={onShareMock} onRestart={onRestartMock} />);
    
    // Find and click the Restart button
    const restartButton = screen.getByRole('button', { name: /Start New Challenge/i });
    fireEvent.click(restartButton);
    
    // Advance timers to trigger the timeout
    vi.advanceTimersByTime(600);
    
    // Check if onRestart was called
    expect(onRestartMock).toHaveBeenCalledTimes(1);
  });
  
  it('displays the correct profile based on score', () => {
    render(<Results onShare={onShareMock} onRestart={onRestartMock} />);
    
    // With an average score of 75, should display "Digital Innovator"
    expect(screen.getByText('Digital Innovator')).toBeInTheDocument();
  });
  
  it('displays the human vs AI comparison section', () => {
    render(<Results onShare={onShareMock} onRestart={onRestartMock} />);
    
    // Check for comparison section
    expect(screen.getByText('Human vs AI Comparison')).toBeInTheDocument();
    expect(screen.getByText('Creative Thinking')).toBeInTheDocument();
    expect(screen.getByText('Pattern Recognition')).toBeInTheDocument();
    expect(screen.getByText('Ethical Reasoning')).toBeInTheDocument();
  });
});
