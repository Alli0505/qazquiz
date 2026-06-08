package kz.qazquiz.api.question

import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@WebMvcTest(QuestionController::class)
class QuestionControllerTest {

    @Autowired
    lateinit var mvc: MockMvc

    @MockitoBean
    lateinit var service: QuestionService

    @Test
    fun `returns questions for a valid difficulty`() {
        Mockito.`when`(service.random(Difficulty.hard, 2)).thenReturn(
            listOf(
                QuestionDto(
                    id = "11111111-1111-1111-1111-111111111111",
                    difficulty = "hard",
                    prompt = mapOf("en" to "Q?", "kz" to "С?"),
                    choices = listOf(mapOf("en" to "A"), mapOf("en" to "B")),
                    correctIndex = 1,
                    icon = "🧠",
                    timeLimit = 300,
                    points = 100,
                ),
            ),
        )

        mvc.get("/api/v1/questions/random?difficulty=hard&count=2").andExpect {
            status { isOk() }
            jsonPath("$[0].correctIndex") { value(1) }
            jsonPath("$[0].prompt.en") { value("Q?") }
            jsonPath("$[0].timeLimit") { value(300) }
        }
    }

    @Test
    fun `rejects an unknown difficulty with 400`() {
        mvc.get("/api/v1/questions/random?difficulty=insane").andExpect {
            status { isBadRequest() }
        }
    }
}
