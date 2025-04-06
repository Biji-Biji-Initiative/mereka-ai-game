import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Welcome } from '@/features/welcome/welcome';

// Mock the useRouter hook
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the useGameStore hook
vi.mock('@/store/game-store', () => ({
  useGameStore: () => ({
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

describe('Welcome Component', () => {
  let onStartMock: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    onStartMock = vi.fn();
  });
  
  it('renders the welcome screen correctly', () => {
    render(<Welcome onStart={onStartMock} />);
    
    // Check for main title
    expect(screen.getByText('AI Fight Club')).toBeInTheDocument();
    
    // Check for subtitle
    expect(screen.getByText(/Test your human abilities against AI/i)).toBeInTheDocument();
    
    // Check for start button
    expect(screen.getByRole('button', { name: /Start Challenge/i })).toBeInTheDocument();
  });
  
  it('calls onStart when the start button is clicked', () => {
    render(<Welcome onStart={onStartMock} />);
    
    // Find and click the start button
    const startButton = screen.getByRole('button', { name: /Start Challenge/i });
    fireEvent.click(startButton);
    
    // Check if onStart was called
    expect(onStartMock).toHaveBeenCalledTimes(1);
  });
  
  it('displays the correct number of challenge cards', () => {
    render(<Welcome onStart={onStartMock} />);
    
    // Check for challenge cards
    const challengeCards = screen.getAllByText(/Challenge:/i);
    expect(challengeCards.length).toBeGreaterThan(0);
  });
  
  it('has accessible elements with proper roles', () => {
    render(<Welcome onStart={onStartMock} />);
    
    // Check for button role
    expect(screen.getByRole('button', { name: /Start Challenge/i })).toHaveAttribute('type', 'button');
    
    // Check for heading roles
    expect(screen.getByRole('heading', { name: /AI Fight Club/i })).toBeInTheDocument();
  });
});
