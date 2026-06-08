package kz.qazquiz.api

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class QazquizApiApplication

fun main(args: Array<String>) {
    runApplication<QazquizApiApplication>(*args)
}
