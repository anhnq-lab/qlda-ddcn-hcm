import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import Button, { IconButton, ButtonGroup } from '../Button';
import { Mail } from 'lucide-react';

describe('Button Component', () => {
    it('renders children correctly', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);
        fireEvent.click(screen.getByText('Click Me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
        const handleClick = vi.fn();
        render(<Button disabled onClick={handleClick}>Disabled</Button>);
        const button = screen.getByText('Disabled').closest('button');
        expect(button).toBeDisabled();
        
        if (button) fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows loading state correctly', () => {
        render(<Button loading loadingText="Saving...">Submit</Button>);
        expect(screen.getByText('Saving...')).toBeInTheDocument();
        expect(screen.queryByText('Submit')).not.toBeInTheDocument();
        
        // Button should be disabled while loading
        const button = screen.getByText('Saving...').closest('button');
        expect(button).toBeDisabled();
    });

    it('renders left and right icons', () => {
        render(
            <Button 
                leftIcon={<span data-testid="left-icon">L</span>}
                rightIcon={<span data-testid="right-icon">R</span>}
            >
                Icon Button
            </Button>
        );
        expect(screen.getByTestId('left-icon')).toBeInTheDocument();
        expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
        render(<Button variant="danger">Delete</Button>);
        const button = screen.getByText('Delete').closest('button');
        // Check if danger class pattern is present
        expect(button?.className).toMatch(/bg-danger-500/);
    });
});

describe('IconButton Component', () => {
    it('renders icon and passes aria-label', () => {
        render(<IconButton icon={<Mail data-testid="mail-icon" />} aria-label="Send Email" />);
        expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
        expect(screen.getByLabelText('Send Email')).toBeInTheDocument();
    });
});

describe('ButtonGroup Component', () => {
    it('renders children correctly', () => {
        render(
            <ButtonGroup>
                <Button>One</Button>
                <Button>Two</Button>
            </ButtonGroup>
        );
        expect(screen.getByText('One')).toBeInTheDocument();
        expect(screen.getByText('Two')).toBeInTheDocument();
    });
});
