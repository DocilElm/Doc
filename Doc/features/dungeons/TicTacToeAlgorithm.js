// Huge thanks to bloom (@unclaimedbloom6)
// for helping me out understanding this algorithm

const checkWinner = (board) => Array(8).fill().map((_,i)=>"012345678036147258048246".slice(i*3,i*3+3).split("").reduce((a,b)=>!!b?[...a,board[parseInt(b)]]:a,[]).filter(a=>!!a)).map(a=>a.length==3?[...new Set(a)]:0).reduce((a,b)=>!!b&&b.length==1?b[0]:a,null)

const alphaBetaAlgorithm = (board, isMaximizingPlayer = false, depth, alpha, beta) => {
    const winner = checkWinner(board)

    if (winner == "X") return 100 - depth
    else if (winner == "O") return depth - 100
    else if (!winner && board.every(a => a)) return 0

    if (isMaximizingPlayer) {
        let bestMove = null

        for (let idx = 0; idx < board.length; idx++) {
            if (board[idx] !== null) continue

            board[idx] = "X"
            let score = alphaBetaAlgorithm(board, false, depth + 1, alpha, beta)
            board[idx] = null
            
            if (score > alpha) {
                alpha = score
                bestMove = idx
            }

            if (alpha > beta) break
        }

        return bestMove
    }

    let bestMove = null

    for (let idx = 0; idx < board.length; idx++) {
        if (board[idx] !== null) continue

        board[idx] = "O"
        let score = alphaBetaAlgorithm(board, true, depth + 1, alpha, beta)
        board[idx] = null

        if (score < beta) {
            beta = score
            bestMove = idx
        }

        if (alpha > beta) break
    }

    return bestMove
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
        let score = alphaBetaAlgorithm(board, 0, true, alpha, beta)
        board[idx] = null

        if (score <= bestScore) continue

        bestScore = score
        bestMove = idx
        alpha = Math.max(alpha, score)

        if (beta <= alpha) break
    }

    return bestMove
}