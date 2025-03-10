
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
					DEFAULT: '#1877F2', // Facebook blue
					foreground: '#FFFFFF',
					hover: '#166FE5', // Facebook blue hover
				},
				secondary: {
					DEFAULT: '#42B72A', // Facebook green
					foreground: '#FFFFFF',
				},
				accent: {
					DEFAULT: '#E7F3FF', // Light blue accent
					foreground: '#1877F2',
				},
				destructive: {
					DEFAULT: '#FA383E', // Facebook red
					foreground: '#FFFFFF',
				},
				muted: {
					DEFAULT: '#F0F2F5', // Facebook light gray
					foreground: '#65676B', // Facebook text gray
				},
				success: {
					DEFAULT: '#42B72A', // Facebook green
					foreground: '#FFFFFF',
				},
				warning: {
					DEFAULT: '#F7B928', // Facebook yellow
					foreground: '#FFFFFF',
				},
				info: {
					DEFAULT: '#1877F2', // Facebook blue
					foreground: '#FFFFFF',
				},
				popover: {
					DEFAULT: '#FFFFFF',
					foreground: '#050505',
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#050505',
				},
				// Neutrals
				white: '#FFFFFF',
				'light-gray': '#F0F2F5', // Facebook background gray
				'medium-gray': '#65676B', // Facebook secondary text
				'dark-gray': '#1C1E21', // Facebook primary text
				black: '#050505',
			},
			borderRadius: {
				lg: '8px',
				md: '6px',
				sm: '4px',
			},
			fontSize: {
				'heading-1': '1.5rem',    // 24px - Facebook uses smaller headings
				'heading-2': '1.25rem',   // 20px
				'heading-3': '1.125rem',  // 18px
				'heading-4': '1rem',      // 16px
				'body': '0.9375rem',      // 15px - Facebook's main text size
				'small': '0.8125rem',     // 13px - Facebook's secondary text size
				'micro': '0.75rem',       // 12px
			},
			fontWeight: {
				normal: '400',
				medium: '500',
				semibold: '600',
				bold: '700',
			},
			fontFamily: {
				'inter': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'], // Facebook-like system font stack
				'poppins': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'], // Using same system font stack
				'mono': ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
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
				'card': '0 1px 2px rgba(0, 0, 0, 0.1)', // Facebook's subtle card shadow
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
