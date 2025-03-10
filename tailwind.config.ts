
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#2563EB', // Primary Blue
					foreground: '#FFFFFF',
					hover: '#1E40AF', // Secondary Blue
				},
				secondary: {
					DEFAULT: '#1E40AF', // Secondary Blue
					foreground: '#FFFFFF',
				},
				accent: {
					DEFAULT: '#3B82F6', // Accent Blue
					foreground: '#FFFFFF',
				},
				destructive: {
					DEFAULT: '#EF4444', // Error Red
					foreground: '#FFFFFF',
				},
				muted: {
					DEFAULT: '#F3F4F6', // Light Gray
					foreground: '#4B5563', // Dark Gray
				},
				success: {
					DEFAULT: '#10B981', // Success Green
					foreground: '#FFFFFF',
				},
				warning: {
					DEFAULT: '#F59E0B', // Warning Yellow
					foreground: '#FFFFFF',
				},
				info: {
					DEFAULT: '#3B82F6', // Info Blue
					foreground: '#FFFFFF',
				},
				popover: {
					DEFAULT: '#FFFFFF',
					foreground: '#1F2937',
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#1F2937',
				},
				// Neutrals
				white: '#FFFFFF',
				'light-gray': '#F3F4F6',
				'medium-gray': '#9CA3AF',
				'dark-gray': '#4B5563',
				black: '#1F2937',
			},
			borderRadius: {
				lg: '0.5rem',
				md: '0.375rem',
				sm: '0.25rem',
			},
			fontSize: {
				'heading-1': '1.75rem', // 28px
				'heading-2': '1.5rem',   // 24px
				'heading-3': '1.25rem',  // 20px
				'heading-4': '1.125rem', // 18px
				'body': '1rem',          // 16px
				'small': '0.875rem',     // 14px
				'micro': '0.75rem',      // 12px
			},
			fontWeight: {
				normal: '400',
				medium: '500',
				semibold: '600',
				bold: '700',
			},
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'poppins': ['Poppins', 'sans-serif'],
				'mono': ['IBM Plex Mono', 'monospace'],
			},
			spacing: {
				'1': '8px',
				'2': '16px',
				'3': '24px',
				'4': '32px',
				'6': '48px',
				'8': '64px',
			},
			boxShadow: {
				'card': '0 4px 6px rgba(0, 0, 0, 0.05)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
