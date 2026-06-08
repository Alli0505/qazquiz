package kz.qazquiz.api.question

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/v1/questions")
class QuestionController(private val service: QuestionService) {

    /**
     * GET /api/v1/questions/random?difficulty=hard&count=10
     * Returns a random set of questions (with answers) for the difficulty.
     */
    @GetMapping("/random")
    fun random(
        @RequestParam(defaultValue = "easy") difficulty: String,
        @RequestParam(defaultValue = "10") count: Int,
    ): List<QuestionDto> {
        val diff =
            Difficulty.fromOrNull(difficulty)
                ?: throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unknown difficulty '$difficulty' (expected easy|medium|hard)",
                )
        return service.random(diff, count)
    }
}
