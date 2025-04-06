import { describe, it, expect, vi } from 'vitest';
import { useGameLogger } from '@/hooks/useGameLogger';

describe('Game Logger Integration Tests', () => {
  it('initializes with correct namespace', () => {
    const logger = useGameLogger('TestComponent');
    expect(logger).toBeDefined();
    expect(logger.logGameEvent).toBeDefined();
    expect(logger.logUserInteraction).toBeDefined();
    expect(logger.logGameProgress).toBeDefined();
  });
  
  it('logs game events correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const logger = useGameLogger('TestComponent');
    
    logger.logGameEvent('test_event', { testData: 'value' });
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0][0]).toContain('GAME EVENT');
    expect(consoleSpy.mock.calls[0][0]).toContain('TestComponent');
    expect(consoleSpy.mock.calls[0][0]).toContain('test_event');
    
    consoleSpy.mockRestore();
  });
  
  it('logs user interactions correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const logger = useGameLogger('TestComponent');
    
    logger.logUserInteraction('button_click', { buttonId: 'test-button' });
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0][0]).toContain('USER INTERACTION');
    expect(consoleSpy.mock.calls[0][0]).toContain('TestComponent');
    expect(consoleSpy.mock.calls[0][0]).toContain('button_click');
    
    consoleSpy.mockRestore();
  });
  
  it('logs game progress correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const logger = useGameLogger('TestComponent');
    
    logger.logGameProgress('round_completed', 75);
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0][0]).toContain('GAME PROGRESS');
    expect(consoleSpy.mock.calls[0][0]).toContain('TestComponent');
    expect(consoleSpy.mock.calls[0][0]).toContain('round_completed');
    expect(consoleSpy.mock.calls[0][0]).toContain('75');
    
    consoleSpy.mockRestore();
  });
});
