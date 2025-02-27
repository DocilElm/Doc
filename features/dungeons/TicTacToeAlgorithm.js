// Huge thanks to bloom (@unclaimedbloom6)
// for helping me out understanding this algorithm

const checkWinner = (board) => Array(8).fill().map((_,i)=>"012345678036147258048246".slice(i*3,i*3+3).split("").reduce((a,b)=>!!b?[...a,board[parseInt(b)]]:a,[]).filter(a=>!!a)).map(a=>a.length==3?[...new Set(a)]:0).reduce((a,b)=>!!b&&b.length==1?b[0]:a,null)

const minmax = (board, depth = 0, isPlayer = false, alpha = -Infinity, beta = Infinity) => {
    const winner = checkWinner(board)
    if (winner === "O") return 100 - depth
    if (winner === "X") return depth - 100
    if (board.every(it => it)) return 0

    if (isPlayer) {
        let bestScore = -Infinity

        for (let idx = 0; idx < board.length; idx++) {
            if (board[idx]) continue

            board[idx] = "O"
            let score = minmax(board, depth + 1, false, alpha, beta)
            board[idx] = null

            bestScore = Math.max(bestScore, score)
            alpha = Math.max(alpha, score)

            if (beta <= alpha) break
        }

        return bestScore
    }

    let bestScore = Infinity

    for (let idx = 0; idx < board.length; idx++) {
        if (board[idx]) continue

        board[idx] = "X"
        let score = minmax(board, depth + 1, true, alpha, beta)
        board[idx] = null

        bestScore = Math.min(bestScore, score)
        beta = Math.min(beta, score)

        if (beta <= alpha) break
    }

    return bestScore
}

export const findBestMove = (board) => {
    let bestMove = -1
    let bestScore = -Infinity

    // Hardcode starting at the center or corner as player
    if (board.filter(it => !!it).length === 1) {
        if (!board[4]) return 4
        return 0
    }

    for (let idx = 0; idx < board.length; idx++) {
        if (board[idx]) continue

        board[idx] = "O"
        let score = minmax(board)
        board[idx] = null

        if (score < bestScore) continue

        bestScore = score
        bestMove = idx
    }

    return bestMove
}