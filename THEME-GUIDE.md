# Digitel Theme Guide

## Cyberpunk Design System

### Color Palette

#### Neon Green (Primary)
- **Main**: `#00ff41` (`neon-500`)
- Used for: Primary buttons, headings in dark mode, hover effects, active states
- Purpose: Creates the signature "hacker" aesthetic

#### Pitch Black (Background)
- **Main**: `#000000` (`dark-500`)
- Used for: Dark mode backgrounds, button text on neon backgrounds
- Purpose: Maximum contrast with neon green

#### Light Mode
- Background: Gray-50 to White gradient
- Text: Gray-900 (dark)
- Accents: Neon-500 for interactive elements

#### Dark Mode
- Background: Dark-500 to Dark-400 gradient
- Text: Neon-500 for headings, Gray-300 for body
- Accents: Neon-500 with glow effects

### Animations

1. **Glow Effect** (`animate-glow`)
   - Pulsing neon glow on headings and key elements
   - Creates cyberpunk aesthetic

2. **Slide Up** (`animate-slideUp`)
   - Modal entrance animation
   - Smooth upward slide with fade

3. **Fade In** (`animate-fadeIn`)
   - General entrance animation
   - Simple opacity transition

4. **Pulse Neon** (`animate-pulse-neon`)
   - Status indicators and icons
   - Subtle breathing effect

### Component Patterns

#### Buttons
- Primary: `bg-neon-500 text-dark-500` with glow shadow
- Hover: Scale transform + increased glow
- Active: Scale down for tactile feedback

#### Cards
- Border: `border-neon-500/30` in dark mode
- Shadow: `shadow-neon-500/20` on hover
- Transform: `hover:scale-105` for interactivity

#### Inputs
- Focus: Ring with neon-500 + shadow glow
- Border: Subtle neon-500/30 in dark mode
- Transitions: All states animated (300ms)

#### Badges
- Active status: Neon-500 with pulse animation
- Error states: Red-400 with matching border
- All badges: Bold font weight + border

### Typography

- **Headings**: Bold weight, neon-500 in dark mode
- **Body**: Medium/regular weight, gray-300 in dark mode
- **Interactive**: Bold weight for buttons/links

### Best Practices

1. Always use `transition-all` or `transition-colors` for smooth mode switching
2. Add `hover:scale-105` for interactive elements
3. Use `animate-glow` sparingly on key headings only
4. Maintain neon-500/20 opacity for subtle glows
5. Border thickness: 1px with opacity for cyberpunk grid aesthetic

### Dark Mode Toggle

Located in Navbar, uses:
- Moon icon (light mode)
- Sun icon (dark mode)
- Persists to localStorage
- Smooth transitions with Tailwind's class strategy
