import QuizGame from '../components/QuizGame'
import GoogleAdsense from '../components/GoogleAdsense'

export default function Home() {
  return (
    <main>
      <QuizGame />
      
      <GoogleAdsense
        slot="xxxxxxxxxxxxxxxx"
        style={{ display: 'block', marginBottom: '20px' }}
      />
    </main>
  )
} 