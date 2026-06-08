package kz.qazquiz.api.question

import org.springframework.stereotype.Service

@Service
class QuestionService(private val repository: QuestionRepository) {
    /** Random set for a difficulty; count is clamped to a sane range. */
    fun random(difficulty: Difficulty, count: Int): List<QuestionDto> {
        val safeCount = count.coerceIn(1, MAX_COUNT)
        return repository.randomByDifficulty(difficulty, safeCount)
    }

    companion object {
        const val MAX_COUNT = 50
    }
}
