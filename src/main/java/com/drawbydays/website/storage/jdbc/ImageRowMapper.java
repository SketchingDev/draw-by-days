package com.drawbydays.website.storage.jdbc;

import com.drawbydays.website.storage.Image;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

class ImageRowMapper implements RowMapper<Image> {

  @Override
  public Image mapRow(ResultSet rs, int rowNum) throws SQLException {
    return new Image(rs.getString("uri"));
  }
}
