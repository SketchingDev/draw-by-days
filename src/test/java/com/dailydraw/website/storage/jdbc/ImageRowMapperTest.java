package com.dailydraw.website.storage.jdbc;

import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.sql.ResultSet;
import org.junit.Test;

public class ImageRowMapperTest {

  @Test
  public void uriIsPassedToImage() throws Throwable {
    final ResultSet resultSet = mock(ResultSet.class);
    new ImageRowMapper().mapRow(resultSet, 0);

    verify(resultSet).getString(eq("uri"));
  }
}