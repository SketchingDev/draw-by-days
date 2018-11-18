package test

import (
	"fmt"
	"testing"
	"time"

	"github.com/gruntwork-io/terratest/modules/http-helper"
	"github.com/gruntwork-io/terratest/modules/random"
	"github.com/gruntwork-io/terratest/modules/terraform"
)

func TestServiceReturnsResponse(t *testing.T) {
	t.Parallel()

	awsRegion := "us-east-1"
	uniqueID := random.UniqueId()

	namespace := fmt.Sprintf("terratest-dynamodb-test-%s", uniqueID)
	// domain := fmt.Sprintf("test-%s.drawbydays.com", uniqueID)

	terraformOptions := &terraform.Options{
		TerraformDir: "../",

		Vars: map[string]interface{}{
			"aws_region": awsRegion,
			"namespace":  namespace,
			// "image_api_domain": domain,
		},
		EnvVars: map[string]string{
			"AWS_DEFAULT_REGION": awsRegion,
		},
	}

	defer terraform.Destroy(t, terraformOptions)

	// When
	terraform.InitAndApply(t, terraformOptions)

	// Then
	instanceURL := terraform.OutputRequired(t, terraformOptions, "private_url")
	instanceURL = fmt.Sprintf("%s/test-value", instanceURL)

	expected := "{\"Count\":0,\"Items\":[],\"ScannedCount\":0}"
	maxRetries := 10
	timeBetweenRetries := 5 * time.Second

	http_helper.HttpGetWithRetry(t, instanceURL, 200, expected, maxRetries, timeBetweenRetries)
}
