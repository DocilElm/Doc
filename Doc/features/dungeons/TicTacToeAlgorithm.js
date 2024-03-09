// Huge thanks to bloom (@unclaimedbloom6)
// for helping me out understanding this algorithm

const checkWinner = (board) => Array(8).fill().map((_,i)=>"012345678036147258048246".slice(i*3,i*3+3).split("").reduce((a,b)=>!!b?[...a,board[parseInt(b)]]:a,[]).filter(a=>!!a)).map(a=>a.length==3?[...new Set(a)]:0).reduce((a,b)=>!!b&&b.length==1?b[0]:a,null)

const miniMax = (board, depth = 0, player = false, alpha, beta) => {
    const winner = checkWinner(board)
    if (winner == "X") return 100 - depth
    else if (winner == "O") return depth - 100
    else if (!winner && board.every(a => a)) return 0

    if (player) {
        let bestScore = -Infinity

        for (let idx = 0; idx < board.length; idx++) {
            if (board[idx] !== null) continue

            board[idx] = "X"
            let score = miniMax(board, depth + 1, false, alpha, beta)
            board[idx] = null

            bestScore = Math.max(score, bestScore)
            alpha = Math.max(alpha, score)

            if (beta <= alpha) break
        }
        
        return bestScore
    }

    let bestScore = Infinity

    for (let idx = 0; idx < board.length; idx++) {
        if (board[idx] !== null) continue

        board[idx] = "O"
        let score = miniMax(board, depth + 1, true, alpha, beta)
        board[idx] = null

        bestScore = Math.min(score, bestScore)
        beta = Math.min(beta, score)

        if (beta <= alpha) break
    }

    return bestScore
}

export const getBestMove = (board) => {
    let bestScore = -Infinity
    let bestMove = null
    let alpha = -Infinity
    let beta = Infinity

    if (board.filter(a => a).length === 1) {
      if (!board[4]) return 4
      else return 0
    }
    
    for (let idx = 0; idx < board.length; idx++) {
        if (board[idx] !== null) continue

        board[idx] = "X"
        let score = miniMax(board, 0, false, alpha, beta)
        board[idx] = null

        if (score <= bestScore) continue

        bestScore = score
        bestMove = idx
        alpha = Math.max(alpha, score)

        if (beta <= alpha) break
    }

    return bestMove
}