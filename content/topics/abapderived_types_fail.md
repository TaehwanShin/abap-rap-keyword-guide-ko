---
title: %fail (실패 원인)
summary: failed 응답에서 인스턴스가 왜 실패했는지를 cause 구성요소에 담아 알려 주는 구조입니다.
keywords: %fail, %fail-cause, cause, 실패 원인, FAILED, IF_ABAP_BEHV, T_FAILINFO, T_FAIL_CAUSE, not_found, if_abap_behv=>cause
---

## 설명

`%fail` 은 BDEF derived type(BDEF 파생 타입)의 구성요소이며, response parameter(응답 매개변수) `FAILED` 안에 들어 있습니다.

`%fail` 은 구조입니다. 실패한 RAP BO 인스턴스가 왜 실패했는지를 구성요소 `cause` 에 담습니다. 실패 원인으로 쓰는 값은 interface `IF_ABAP_BEHV` 에 정의되어 있습니다. 예를 들어 찾을 수 없는 항목은 `NOT_FOUND` 입니다.

### 타입

- `%fail` : `IF_ABAP_BEHV=>T_FAILINFO`
- `%fail-cause` : `IF_ABAP_BEHV=>T_FAIL_CAUSE`

### 쓰이는 곳

[[abaptype_table_for|TYPE TABLE FOR]] 와 [[abaptype_structure_for|TYPE STRUCTURE FOR]] 의 다음 타입에 들어 있습니다.

- `FAILED [EARLY|LATE]`

## 예제

여행 두 건을 읽습니다. 없는 여행은 `FAILED` 로 돌아오고, `%fail-cause` 로 원인을 확인할 수 있습니다.

```abap
READ ENTITY zr_travel
  ALL FIELDS WITH VALUE #( ( travelid = '00000001' )
                           ( travelid = '99999999' ) )   " 없는 여행
  RESULT DATA(lt_travel)
  FAILED DATA(ls_failed).

LOOP AT ls_failed-travel ASSIGNING FIELD-SYMBOL(<ls_failed>).
  IF <ls_failed>-%fail-cause = if_abap_behv=>cause-not_found.
    " <ls_failed>-travelid 의 여행을 찾지 못했다
  ENDIF.
ENDLOOP.
```

## 알아두기

- SAP 예제 [[abenderived_types_fail_abexa]] 는 managed BO 에서 `%fail` 을 쓰는 모습을 보여 줍니다. 원문에 실린 코드 조각은 그 예제 behavior pool(동작 풀)의 `get_instance_features` 메서드 구현입니다.
- 메시지 처리 전반은 ABAP RESTful Application Programming Model 개발 안내서의 Messages 절에 나옵니다.

## 관련 항목

- [[abapderived_types_info]]
- [[abapderived_types_msg]]
- [[abaptype_response_for]]
- [[abapeml_response]]
- [[abenderived_types_fail_abexa]]
