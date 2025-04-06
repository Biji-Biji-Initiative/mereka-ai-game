import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Round } from '@/features/rounds/round';

// Mock the useGameStore hook
vi.mock('@/store/game-store', () => ({
  useGameStore: () => ({
    setRoundResult: vi.fn(),
  }),
}));

// Mock the useGameLogger hook
vi.mock('@/hooks/useGameLogger', () => ({
  useGameLogger: () => ({
    logGameEvent: vi.fn(),
    logUserInteraction: vi.fn(),
    logGameProgress: vi.fn(),
  }),
}));

// Mock timer
vi.useFakeTimers();

describe('Round Component', () => {
  let onCompleteMock: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    onCompleteMock = vi.fn();
    vi.clearAllTimers();
  });
  
  it('renders the round screen correctly', () => {
    render(<Round roundNumber={1} onComplete={onCompleteMock} />);
    
    // Check for round title
    expect(screen.getByText(/Round 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Pattern Recognition/i)).toBeInTheDocument();
    
    // Check for timer
    expect(screen.getByText(/60 seconds/i)).toBeInTheDocument();
    
    // Check for step indicator
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
    
    // Check for navigation buttons
    expect(screen.getByRole('button', { name: /Next Step/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Previous Step/i })).toBeInTheDocument();
  });
  
  it('disables the Previous button on the first step', () => {
    render(<Round roundNumber={1} onComplete={onCompleteMock} />);
    
    // Check if Previous button is disabled on first step
    const previousButton = screen.getByRole('button', { name: /Previous Step/i });
    expect(previousButton).toBeDisabled();
  });
  
  it('enables the Previous button after moving to the second step', () => {
    render(<Round roundNumber={1} onComplete={onCompleteMock} />);
    
    // Click Next to move to second step
    const nextButton = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextButton);
    
    // Check if Previous button is now enabled
    const previousButton = screen.getByRole('button', { name: /Previous Step/i });
    expect(previousButton).not.toBeDisabled();
  });
  
  it('changes the button text to "Complete Round" on the last step', () => {
    render(<Round roundNumber={1} onComplete={onCompleteMock} />);
    
    // Click Next twice to get to the last step
    const nextButton = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    
    // Check if button text changed to Complete Round
    expect(screen.getByRole('button', { name: /Complete Round/i })).toBeInTheDocument();
  });
  
  it('calls onComplete when completing the round', () => {
    render(<Round roundNumber={1} onComplete={onCompleteMock} />);
    
    // Click Next twice to get to the last step
    const nextButton = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    
    // Click Complete Round
    const completeButton = screen.getByRole('button', { name: /Complete Round/i });
    fireEvent.click(completeButton);
    
    // Check if onComplete was called
    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });
  
  it('decrements the timer every second', () => {
    render(<Round roundNumber={1} onComplete={onCompleteMock} />);
    
    // Check initial timer value
    expect(screen.getByText(/60 seconds/i)).toBeInTheDocument();
    
    // Advance timer by 1 second
    vi.advanceTimersByTime(1000);
    
    // Check updated timer value
    expect(screen.getByText(/59 seconds/i)).toBeInTheDocument();
  });
  
  it('calls onComplete when timer expires', () => {
    render(<Round roundNumber={1} onComplete={onCompleteMock} />);
    
    // Advance timer by 61 seconds to ensure it expires
    vi.advanceTimersByTime(61000);
    
    // Check if onComplete was called
    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });
});
