tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: {
          main: '#080808',
          card: '#111113',
          cardHover: '#161619',
          input: '#0c0c0e',
          border: '#242429',
          borderFocus: '#fffff2'
        },
        ivory: {
          DEFAULT: '#fffff2',
          muted: '#b5b5ba',
          dim: '#75757d'
        }
      }
    }
  }
}
