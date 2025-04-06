import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Focus } from '@/features/focus/focus';

// Mock the useGameStore hook
vi.mock('@/store/game-store', () => ({
  useGameStore: () => ({
    setSelectedFocus: vi.fn(),
  }),
}));

// Mock the useGameLogger hook
vi.mock('@/hooks/useGameLogger', () => ({
  useGameLogger: () => ({
    logGameEvent: vi.fn(),
    logUserInteraction: vi.fn(),
  }),
}));

describe('Focus Component', () => {
  let onCompleteMock: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    onCompleteMock = vi.fn();
  });
  
  it('renders the focus selection screen correctly', () => {
    render(<Focus onComplete={onCompleteMock} />);
    
    // Check for main title
    expect(screen.getByText('Choose Your Focus')).toBeInTheDocument();
    
    // Check for focus areas
    expect(screen.getByText('Creative Thinking')).toBeInTheDocument();
    expect(screen.getByText('Analytical Reasoning')).toBeInTheDocument();
    expect(screen.getByText('Emotional Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Ethical Decision Making')).toBeInTheDocument();
    
    // Check for begin button (should be disabled initially)
    const beginButton = screen.getByRole('button', { name: /Begin/i });
    expect(beginButton).toBeDisabled();
  });
  
  it('enables the Begin button after selecting a focus area', () => {
    render(<Focus onComplete={onCompleteMock} />);
    
    // Find and click a focus area
    const creativeThinking = screen.getByText('Creative Thinking');
    fireEvent.click(creativeThinking.closest('div[role="button"]') as HTMLElement);
    
    // Check if Begin button is now enabled
    const beginButton = screen.getByRole('button', { name: /Begin/i });
    expect(beginButton).not.toBeDisabled();
  });
  
  it('calls onComplete when the Begin button is clicked after selection', async () => {
    render(<Focus onComplete={onCompleteMock} />);
    
    // Find and click a focus area
    const analyticalReasoning = screen.getByText('Analytical Reasoning');
    fireEvent.click(analyticalReasoning.closest('div[role="button"]') as HTMLElement);
    
    // Click the Begin button
    const beginButton = screen.getByRole('button', { name: /Begin/i });
    fireEvent.click(beginButton);
    
    // Wait for the timeout in the component
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Check if onComplete was called
    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });
  
  it('allows keyboard navigation for accessibility', () => {
    render(<Focus onComplete={onCompleteMock} />);
    
    // Find a focus area
    const ethicalDecision = screen.getByText('Ethical Decision Making');
    const focusElement = ethicalDecision.closest('div[role="button"]') as HTMLElement;
    
    // Simulate keyboard interaction
    fireEvent.keyDown(focusElement, { key: 'Enter' });
    
    // Check if Begin button is now enabled
    const beginButton = screen.getByRole('button', { name: /Begin/i });
    expect(beginButton).not.toBeDisabled();
  });
  
  it('displays focus area descriptions', () => {
    render(<Focus onComplete={onCompleteMock} />);
    
    // Check for descriptions
    expect(screen.getByText(/Test your creative problem-solving abilities/i)).toBeInTheDocument();
    expect(screen.getByText(/Challenge your logical and analytical skills/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore how your emotional intelligence compares/i)).toBeInTheDocument();
    expect(screen.getByText(/Navigate complex ethical dilemmas/i)).toBeInTheDocument();
  });
});
