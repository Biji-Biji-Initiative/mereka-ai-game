import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Assessment } from '@/features/assessment/assessment';

// Mock the useGameStore hook
vi.mock('@/store/game-store', () => ({
  useGameStore: () => ({
    setTraits: vi.fn(),
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

describe('Assessment Component', () => {
  let onCompleteMock: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    onCompleteMock = vi.fn();
  });
  
  it('renders the assessment screen correctly', () => {
    render(<Assessment onComplete={onCompleteMock} />);
    
    // Check for main title
    expect(screen.getByText('AI Personality Assessment')).toBeInTheDocument();
    
    // Check for first question
    expect(screen.getByText(/How comfortable are you with AI tools/i)).toBeInTheDocument();
    
    // Check for rating options
    expect(screen.getByText('Strongly Disagree')).toBeInTheDocument();
    expect(screen.getByText('Strongly Agree')).toBeInTheDocument();
    
    // Check for navigation buttons
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument();
  });
  
  it('disables the Previous button on the first question', () => {
    render(<Assessment onComplete={onCompleteMock} />);
    
    // Check if Previous button is disabled on first question
    const previousButton = screen.getByRole('button', { name: /Previous/i });
    expect(previousButton).toBeDisabled();
  });
  
  it('enables the Previous button after moving to the second question', () => {
    render(<Assessment onComplete={onCompleteMock} />);
    
    // Click Next to move to second question
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);
    
    // Check if Previous button is now enabled
    const previousButton = screen.getByRole('button', { name: /Previous/i });
    expect(previousButton).not.toBeDisabled();
  });
  
  it('allows selecting different rating values', () => {
    render(<Assessment onComplete={onCompleteMock} />);
    
    // Find and click rating option 5
    const ratingOption5 = screen.getByRole('tab', { name: '5' });
    fireEvent.click(ratingOption5);
    
    // Check if the option is selected (has aria-selected="true")
    expect(ratingOption5).toHaveAttribute('aria-selected', 'true');
  });
  
  it('calls onComplete after answering all questions', async () => {
    render(<Assessment onComplete={onCompleteMock} />);
    
    // Answer all 5 questions by clicking Next
    const nextButton = screen.getByRole('button', { name: /Next/i });
    
    // Question 1
    fireEvent.click(nextButton);
    
    // Question 2
    fireEvent.click(nextButton);
    
    // Question 3
    fireEvent.click(nextButton);
    
    // Question 4
    fireEvent.click(nextButton);
    
    // Question 5 (Complete button)
    const completeButton = screen.getByRole('button', { name: /Complete/i });
    fireEvent.click(completeButton);
    
    // Wait for the timeout in the component
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Check if onComplete was called
    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });
});
