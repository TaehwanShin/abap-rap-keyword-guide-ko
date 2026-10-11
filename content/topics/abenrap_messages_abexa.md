---
title: RAP 메시지 예제 - transition message 와 상태 메시지
summary: draft 를 쓰는 managed RAP BO 의 validation 에서 상태 메시지와 transition message 를 함께 돌려주고, 두 메시지가 언제 어디서 보이는지 견주는 예제입니다.
keywords: RAP 메시지, 전이 메시지, 상태 메시지, transition message, state message, %state_area, %msg, reported, failed, validation, 검증, Prepare, Activate, READ ENTITY REPORTED, 초안, 예제
---

## 설명

이 예제는 draft 를 쓰는 managed RAP BO 로 **transition message(전이 메시지)**와 **상태 메시지**의 차이를 보여 줍니다.

- **transition message** : 요청 한 번에 딸려 나오는 메시지입니다. 그 요청의 응답에만 있고 남지 않습니다.
- **상태 메시지** : 인스턴스의 상태에 붙는 메시지입니다. `reported` 에 넣을 때 `%state_area` 를 채우면 상태 메시지가 됩니다. 저장되어 남아 있고, EML 에서는 `READ` 문으로만 받을 수 있습니다.

원문 예제의 behavior definition(동작 정의)에는 validation 이 하나 있습니다. 이 validation 은 특정 필드의 값을 확인해서, 값이 틀리면 상태 메시지를, 값이 맞으면 transition message 를 돌려줍니다. 보통 validation 은 transition message 보다 상태 메시지를 돌려줍니다. 여기서는 두 메시지를 견주어 보려고 일부러 둘 다 넣었습니다.

validation 은 `draft determine action Prepare` 에 묶여 있습니다. 그래서 draft 가 active(활성) 데이터로 넘어가기 전에 draft 데이터를 검증합니다.

### 예제가 밟는 단계

| 단계 | 하는 일 | 결과 |
| --- | --- | --- |
| 1a | draft 인스턴스 하나를 만들고 저장합니다. | draft 테이블에만 있습니다. 오류가 없어 `failed`, `reported` 는 비어 있습니다. |
| 1b | `Activate` 를 실행하고 저장합니다. | validation 이 불리고 통과합니다. "인스턴스가 올바르다"는 transition message 가 옵니다. draft 테이블은 비고 persistent table 에 인스턴스가 들어갑니다. |
| 2a | 같은 키로 한 번 더 만듭니다. | persistent table 에 같은 키가 이미 있어 실패합니다. `failed` 에 항목이 생기고 `reported` 에 표준 transition message 가 옵니다. draft 테이블에는 아무것도 없습니다. |
| 2b | `Activate` 를 실행합니다. | draft 가 없으므로 아무 일도 일어나지 않습니다. |
| 3a | 올바른 인스턴스와 틀린 인스턴스를 함께 draft 로 만듭니다. | 둘 다 draft 테이블에 들어갑니다. 이때는 validation 이 불리지 않아 메시지가 없습니다. |
| 3b | 두 인스턴스에 `Activate` 를 실행합니다. | validation 이 불립니다. 올바른 쪽은 정보 transition message 를 받고 persistent table 에 저장됩니다. 틀린 쪽은 `failed` 와 `reported` 에 항목이 생기고 draft 로 남습니다. |
| 4 | 두 인스턴스를 draft 표시를 켠 것과 끈 것으로 각각 읽습니다. | 올바른 인스턴스는 active 로만, 틀린 인스턴스는 draft 로만 찾아집니다. `READ` 의 `reported` 에 상태 메시지가 들어 있습니다. |
| 5 | 틀린 draft 를 고치고 `Activate` 를 실행합니다. | validation 을 통과합니다. transition message 가 오고, 고친 인스턴스가 persistent table 에 저장됩니다. draft 테이블에서는 사라집니다. |

## 예제

공통 예제 모델로 줄여 쓴 것입니다. 원문은 validation 구현을 싣지 않으므로 validation 메서드는 같은 동작을 하도록 직접 쓴 것입니다. `Status` 가 `X` 이면 틀린 것으로 봅니다.

```bdl
validation validateStatus on save { field Status; }

draft determine action Prepare
{
  validation validateStatus;
}
```

```abap
METHOD validatestatus.
  READ ENTITIES OF zr_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( status ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  LOOP AT lt_travel INTO DATA(ls_travel).
    " 전에 남긴 상태 메시지를 지운다
    APPEND VALUE #( %tky        = ls_travel-%tky
                    %state_area = `CHECK_STATUS` ) TO reported-travel.

    IF ls_travel-status = 'X'.
      APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.

      " 상태 메시지: %state_area 를 채운다
      APPEND VALUE #( %tky            = ls_travel-%tky
                      %state_area     = `CHECK_STATUS`
                      %element-status = if_abap_behv=>mk-on
                      %msg            = new_message_with_text(
                                          severity = if_abap_behv_message=>severity-error
                                          text     = '상태 값이 올바르지 않습니다.' ) )
             TO reported-travel.
    ELSE.
      " transition message: %state_area 를 비워 둔다
      APPEND VALUE #( %tky = ls_travel-%tky
                      %msg = new_message_with_text(
                               severity = if_abap_behv_message=>severity-information
                               text     = '여행 데이터가 올바릅니다.' ) )
             TO reported-travel.
    ENDIF.
  ENDLOOP.
ENDMETHOD.
```

RAP BO consumer(사용자) 쪽에서는 활성화할 때 transition message 를 받고, 상태 메시지는 `READ` 로 받습니다.

```abap
" 활성화: Prepare 에 묶인 validation 이 불린다
MODIFY ENTITY zr_travel
  EXECUTE Activate AUTO FILL CID
    WITH VALUE #( ( %key-travelid = '00000003' ) )
  MAPPED   DATA(ls_mapped)
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).      " transition message 만 들어 있다

COMMIT ENTITIES RESPONSE OF zr_travel
  FAILED   DATA(ls_failed_late)
  REPORTED DATA(ls_reported_late).

" draft 로 남은 인스턴스를 읽으면서 상태 메시지를 받는다
READ ENTITY zr_travel
  ALL FIELDS WITH VALUE #( ( travelid  = '00000003'
                             %is_draft = if_abap_behv=>mk-on ) )
  RESULT   DATA(lt_travel)
  FAILED   DATA(ls_read_failed)
  REPORTED DATA(ls_read_reported). " 상태 메시지가 들어 있다
```

### 눈여겨볼 점

- **3b 단계** : 틀린 인스턴스의 `failed` 항목에는 실패 원인이 `UNSPECIFIC` 으로 나옵니다. 이 항목은 validation 구현에서 넣은 것입니다. `reported` 에 온 오류 transition message 는 프레임워크가 넣은 표준 메시지입니다. validation 에서 `reported` 에 넣은 상태 메시지는 이 `MODIFY` 응답에서 RAP BO consumer 에게 보이지 않습니다.
- **4단계** : `READ` 요청에 `REPORTED` 를 적으면 상태 메시지를 받을 수 있습니다. 이때 `%state_area` 에는 behavior pool(동작 풀)에서 넣은 원래 값이 아니라 미리 정해진 값 `%STATE` 가 들어 있습니다. 원래 값은 RAP BO consumer 에게 의미가 없기 때문입니다.
- **4단계** : 앞 단계의 transition message 는 더는 받을 수 없습니다. 상태 메시지는 저장되어 있어서 그대로 받을 수 있습니다.
- **원래 `%state_area` 값 보기** : 원문 예제의 validation 은 `IN LOCAL MODE` 로 읽으면서 `reported` 도 함께 받아 둡니다. behavior pool 안에서는 지정한 키의 상태 메시지와 원래 `%state_area` 값을 볼 수 있기 때문입니다. 받은 내용을 behavior pool 의 내부 테이블에 담아 두었다가 화면에 보여 줍니다. 3b 단계에서는 이 테이블이 비어 있고, 5단계에서는 상태 메시지와 원래 `%state_area` 값이 나옵니다.

## 알아두기

- 예제 전체에서 저장 단계의 응답(`FAILED LATE`, `REPORTED LATE`)에는 항목이 한 번도 생기지 않습니다. 빠짐없이 보여 주려고 넣어 둔 것입니다.
- 상태 메시지는 RAP BO provider(제공자) 구현에서 직접 지워야 합니다. 위 validation 메서드의 첫 `APPEND` 가 그 일을 합니다. 자세한 내용은 [[abapderived_types_state_area]] 에 있습니다.

## 관련 항목

- [[abapderived_types_state_area]]
- [[abapderived_types_msg]]
- [[abaptype_response_for]]
- [[abenbdl_validations]]
- [[abenbdl_determine_action]]
- [[abenbdl_draft_action]]
- [[abapemlcommit_entities_long]]
