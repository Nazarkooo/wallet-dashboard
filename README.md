# wallet-dashboard

## Stack

Built with Next.js 16 (App Router), TypeScript, Framer Motion for button animations, NumberFlow for smooth number transitions, Ethers.js for blockchain stuff, Recharts for charts, and EtherScan API to fetch data.

## Structure

```
app/
├── actions/     - server actions
├── components/  - react components
├── lib/         - utils and helpers
├── types/       - typescript types
└── ...
```

## Setup

First install dependencies:

```bash
npm install
```

Then create `.env.local` file:

```bash
npm run setup:env
```

Fill in the values. **See SETUP.md for detailed instructions** on where to get each key.

After that just run:

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```
