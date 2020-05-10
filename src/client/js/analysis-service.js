

export async function getTrends(symbol, name) {
    const response = await fetch(`http://localhost:3000/sentiment/${symbol}`)

}