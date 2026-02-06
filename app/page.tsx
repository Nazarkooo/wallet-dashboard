import WalletCard from './components/WalletCard.server'
import ProfitLossCard from './components/ProfitLossCard.server'

export default function Home() {
  return (
    <main className="min-h-screen bg-[rgb(178,57,0)] overflow-x-hidden flex items-center justify-center">
      <div className="flex flex-row max-[950px]:flex-col items-center justify-center w-full box-border gap-[19px] px-[140px] max-[950px]:px-4 max-[390px]:px-2 max-[950px]:py-5">
        <WalletCard />
        <ProfitLossCard />
      </div>
    </main>
  )
}
