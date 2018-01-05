package com.dailydraw.website.storage.jdbc;

import com.dailydraw.website.storage.Image;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

class ImageRowMapper implements RowMapper<Image> {

  @Override
  public Image mapRow(ResultSet rs, int rowNum) throws SQLException {
    return new Image(rs.getString("uri"));
  }
}
