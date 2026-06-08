package kz.qazquiz.api.question

/**
 * A question as served to trusted server-side callers (the socket server).
 * Includes `correctIndex` — the API is server-to-server; the public web
 * client never receives the answer (the socket layer strips it).
 *
 * `prompt` and `choices` are localized maps, e.g. {"en": "...", "kz": "..."}.
 */
data class QuestionDto(
    val id: String,
    val difficulty: String,
    val prompt: Map<String, String>,
    val choices: List<Map<String, String>>,
    val correctIndex: Int,
    val icon: String?,
    val timeLimit: Int,
    val points: Int,
)

enum class Difficulty {
    easy,
    medium,
    hard;

    companion object {
        fun fromOrNull(value: String): Difficulty? =
            entries.firstOrNull { it.name == value.lowercase() }
    }
}
