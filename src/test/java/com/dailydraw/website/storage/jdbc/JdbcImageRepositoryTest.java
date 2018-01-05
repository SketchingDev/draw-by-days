package com.dailydraw.website.storage.jdbc;

import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Collections;
import org.junit.Test;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcImageRepositoryTest {

  @Test(expected = NullPointerException.class)
  public void exceptionThrownIfInstantiatedWithNull() {
    new JdbcImageRepository(null);
  }

  @Test
  public void queryCalledOnJdbcTemplateWhenGetRandomImageCalled() {
    final JdbcTemplate template = mock(JdbcTemplate.class);
    when(template.query(anyString(), any(ImageRowMapper.class)))
        .thenReturn(Collections.emptyList());

    new JdbcImageRepository(template).getRandomImage();
  }
}