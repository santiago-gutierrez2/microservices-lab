package com.microlab.catalog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@EnableKafka
@SpringBootApplication
public class CatalogApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(CatalogApiApplication.class, args);
	}

}
