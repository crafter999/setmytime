#define _DEFAULT_SOURCE
#include <assert.h>
#include <node_api.h>
#include <time.h>

int SET_SYSTEM_DATE(long timestamp, long nanosecs) {
  struct timespec ts;
  ts.tv_sec = timestamp;
  ts.tv_nsec = nanosecs;

  int result = clock_settime(CLOCK_REALTIME, &ts);

  return result;
}

static napi_value setDate(napi_env env, napi_callback_info info) {
  napi_status status;

  size_t argc = 2;
  napi_value args[2];
  status = napi_get_cb_info(env, info, &argc, args, NULL, NULL);
  assert(status == napi_ok);

  if (argc < 2) {
    napi_throw_type_error(env, NULL, "Invalid args");
    return NULL;
  }

  double timestamp;
  status = napi_get_value_double(env, args[0], &timestamp);
  assert(status == napi_ok);

  double nanosecs;
  status = napi_get_value_double(env, args[1], &nanosecs);
  assert(status == napi_ok);

  int ssd = SET_SYSTEM_DATE(timestamp,nanosecs);

  napi_value result;
  status = napi_create_double(env, ssd, &result);
  assert(status == napi_ok);

  return result;
}

#define DECLARE_NAPI_METHOD(name, func) \
  { name, 0, func, 0, 0, 0, napi_default, 0 }
napi_value Init(napi_env env, napi_value exports) {
  napi_status status;
  napi_property_descriptor addDescriptor =
      DECLARE_NAPI_METHOD("setDate", setDate);
  status = napi_define_properties(env, exports, 1, &addDescriptor);
  assert(status == napi_ok);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)