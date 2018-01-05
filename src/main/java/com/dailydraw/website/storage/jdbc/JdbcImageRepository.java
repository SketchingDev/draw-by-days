package com.dailydraw.website.storage.jdbc;

import com.dailydraw.website.storage.Image;
import com.dailydraw.website.storage.ImageRepository;
import java.util.Objects;
import java.util.Optional;
import javax.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcImageRepository implements ImageRepository {

  private final JdbcTemplate jdbcTemplate;

  @Autowired
  public JdbcImageRepository(@NotNull final JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = Objects.requireNonNull(jdbcTemplate);
  }

  @Override
  public Optional<Image> getRandomImage() {
    return jdbcTemplate
        .query("SELECT * FROM images ORDER BY RAND() LIMIT 1", new ImageRowMapper())
        .stream()
        .findFirst();
  }
}
