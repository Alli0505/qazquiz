package kz.qazquiz.api.question

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import org.jooq.DSLContext
import org.springframework.stereotype.Repository

@Repository
class QuestionRepository(
    private val dsl: DSLContext,
    private val mapper: ObjectMapper,
) {
    private val localizedMap = object : TypeReference<Map<String, String>>() {}
    private val localizedList = object : TypeReference<List<Map<String, String>>>() {}

    /**
     * Draw a random set of active, standalone (bank) questions for a
     * difficulty. `difficulty` is cast to the Postgres enum type.
     */
    fun randomByDifficulty(difficulty: Difficulty, count: Int): List<QuestionDto> {
        val records =
            dsl.resultQuery(
                """
                SELECT id, difficulty, prompt, choices, correct_index, icon, time_limit, points
                FROM questions
                WHERE difficulty = CAST(? AS difficulty)
                  AND is_active = TRUE
                  AND quiz_id IS NULL
                ORDER BY random()
                LIMIT ?
                """.trimIndent(),
                difficulty.name,
                count,
            ).fetch()

        return records.map { r ->
            QuestionDto(
                id = r.get("id").toString(),
                difficulty = r.get("difficulty").toString(),
                prompt = mapper.readValue(r.get("prompt").toString(), localizedMap),
                choices = mapper.readValue(r.get("choices").toString(), localizedList),
                correctIndex = (r.get("correct_index") as Number).toInt(),
                icon = r.get("icon")?.toString(),
                timeLimit = (r.get("time_limit") as Number).toInt(),
                points = (r.get("points") as Number).toInt(),
            )
        }
    }
}
