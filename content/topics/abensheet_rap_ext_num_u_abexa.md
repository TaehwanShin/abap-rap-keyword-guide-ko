---
title: 예제 - EML 실전, external numbering 을 쓰는 unmanaged RAP BO
summary: 키를 사용자가 직접 주는 unmanaged RAP BO 로 standard operation, action, feature control, 권한, association 을 거친 생성과 읽기, 동적 EML 을 차례로 실행해 보는 종합 예제입니다.
keywords: ABAP EML in use, unmanaged, 비관리형, external numbering, 외부 번호 부여, MODIFY ENTITIES, READ ENTITIES, EXECUTE, features instance, features global, 기능 제어, authorization master instance, 인스턴스 권한, %cid_ref, %fail-cause, %op, READ ENTITIES OPERATIONS, full, 동적 EML, 예제
---

## 설명

[[abensheet_rap_ext_num_m_abexa|managed 예제]]와 짝을 이루는 예제입니다. 데이터 모델은 같고(root entity(루트 엔터티)와 child entity(자식 엔터티) 하나씩, 키는 사용자가 주는 external numbering), 구현 방식만 **unmanaged** 입니다. 그래서 모든 작업을 behavior pool(동작 풀)의 로컬 클래스에서 직접 구현합니다.

behavior definition(동작 정의)는 managed 예제와 이런 점이 다릅니다.

- persistent table 을 적지 않습니다. validation 과 determination 도 없습니다.
- 권한이 `authorization master ( instance )` 입니다. 생성에만 `authorization : none` 을 붙였습니다.
- action 이 세 개입니다. 하나는 조건이 없고, 하나는 instance feature control(기능 제어), 하나는 global feature control 이 걸려 있습니다.
- child entity 에는 수정·삭제가 없습니다.

실행 클래스가 밟는 차례는 다음과 같습니다. 요청마다 일부러 실패하는 인스턴스를 섞고, 끝난 뒤 DB 테이블과 response parameter(응답 매개변수) 내용을 출력합니다.

| 차례 | 내용 | 눈여겨볼 점 |
| --- | --- | --- |
| 1 | 생성 | `FIELDS` 목록에 없는 필드는 값을 줘도 저장되지 않습니다. 이미 있는 키는 실패합니다. |
| 2 | 수정 | 같은 요청에서 만든 인스턴스를 `%cid_ref` 로 가리켜 고칩니다. |
| 3 | 삭제 | instance 권한 핸들러가 한 필드의 값이 `'X'` 인 인스턴스는 지우지 못하게 막습니다. |
| 4 | action 1 | 두 숫자 필드에 2 를 곱합니다. 조건이 없습니다. |
| 5 | action 2 | 3 을 곱합니다. instance feature control 이 걸려 있어, 두 숫자가 모두 0 이면 실행할 수 없습니다. |
| 6 | action 3 | 한 필드에 `'Z'` 를 넣습니다. global feature control 이 걸려 있어, 예제를 실행하는 시간대에 따라 실행할 수 없기도 합니다. |
| 7 | association 을 거친 생성 | 루트와 자식을 한 요청으로 만드는 deep create 입니다. |
| 8 | 읽기 | 루트 읽기, 자식 직접 읽기, 부모→자식 읽기, 자식→부모 읽기 |
| 9 | 곁들임: 동적 EML | `READ ENTITIES OPERATIONS` 에서 `full` 을 켰을 때와 껐을 때를 견줍니다. |

## 예제

behavior definition 입니다.

```bdl
unmanaged implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
lock master
authorization master ( instance )
{
  create ( authorization : none );
  update;
  delete;
  association _Booking { create; }
  action doublePrice;
  action ( features : instance ) triplePrice;   // 인스턴스마다 켜고 끈다
  action ( features : global ) markChecked;     // 전체에 한꺼번에 켜고 끈다
  field ( readonly : update ) TravelID;
}

define behavior for ZR_Booking alias Booking
lock dependent by _Travel
authorization dependent by _Travel
{
  field ( readonly ) TravelID;
  field ( readonly : update ) BookingID;
  association _Travel;
}
```

RAP BO consumer(사용자) 쪽 코드의 뼈대입니다.

```abap
" 삭제는 FROM 으로만 쓴다. 권한 핸들러가 막은 인스턴스와 없는 키는 failed 에 담긴다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( TravelID AgencyID Status )
      WITH VALUE #( ( %cid = 'cid_del' TravelID = '00000006' AgencyID = '070001' Status = 'N' ) )
    DELETE FROM VALUE #( ( %cid_ref = 'cid_del' )        " 방금 만든 것
                         ( TravelID = '00000004' )       " 키로
                         ( TravelID = '00000003' )       " 권한 핸들러가 막는다
                         ( TravelID = '99999999' ) )     " 없는 키
  MAPPED DATA(ls_mapped) FAILED DATA(ls_failed) REPORTED DATA(ls_reported).
COMMIT ENTITIES.

" feature control 이 걸린 action: 조건에 맞지 않는 인스턴스는 failed 에 담긴다
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    EXECUTE triplePrice
      FROM VALUE #( ( TravelID = '00000001' ) ( TravelID = '00000002' ) )
  FAILED ls_failed REPORTED ls_reported.
COMMIT ENTITIES.

" failed 를 풀어 본다: 어떤 작업이 왜 실패했는가
LOOP AT ls_failed-travel ASSIGNING FIELD-SYMBOL(<ls_err>).
  DATA(lv_op) = COND string(
    WHEN <ls_err>-%op-%delete             = if_abap_behv=>mk-on THEN `삭제`
    WHEN <ls_err>-%op-%action-triplePrice = if_abap_behv=>mk-on THEN `action triplePrice`
    ELSE `작업` ).
  DATA(lv_text) = <ls_err>-TravelID && `: ` && lv_op &&
                  ` 실패, 원인 ` && <ls_err>-%fail-cause.
ENDLOOP.

" 곁들임: 동적 EML 로 association 을 거친 읽기
DATA: lt_rba_in   TYPE TABLE FOR READ IMPORT zr_travel\_Booking,
      lt_rba_out  TYPE TABLE FOR READ RESULT zr_travel\_Booking,
      lt_rba_link TYPE TABLE FOR READ LINK zr_travel\_Booking.

lt_rba_in = VALUE #( ( %key-TravelID = '00000001'
                       %control = VALUE #( BookingID  = if_abap_behv=>mk-on
                                           FlightDate = if_abap_behv=>mk-on ) ) ).

DATA(lt_ops) = VALUE abp_behv_retrievals_tab(
  ( op          = if_abap_behv=>op-r-read_ba
    entity_name = 'ZR_TRAVEL'
    sub_name    = '_BOOKING'
    full        = abap_true          " 끄면 lt_rba_link 만 채워진다
    instances   = REF #( lt_rba_in )
    results     = REF #( lt_rba_out )
    links       = REF #( lt_rba_link ) ) ).

READ ENTITIES OPERATIONS lt_ops.
```

## 알아두기

- **`full` 표시** : 동적 꼴로 association 을 거쳐 읽을 때 `full` 을 켜지 않으면 association 연결(link)만 돌아옵니다. `results` 로 넘긴 테이블은 비어 있습니다. 예제는 같은 요청을 `full` 을 끄고 한 번, 켜고 한 번 실행해 결과를 견줍니다.
- **`FROM` 만 되는 작업** : 삭제와 action 실행은 `FROM` 으로만 쓸 수 있습니다. 생성을 `CREATE FROM` 으로 쓰면 `%control` 을 직접 on 으로 해 주어야 합니다.
- **`%cid_ref`** : 수정, 삭제, action 실행 요청 앞에 생성 요청을 함께 넣어 두었습니다. 아직 저장되지 않은 인스턴스를 `%cid_ref` 로 가리키는 모습을 보이려는 것입니다.
- **읽기** : `ALL FIELDS WITH` 는 모든 필드를 읽고 `%control` 을 모두 on 으로 둡니다. `RESULT` 는 꼭 적어야 합니다. association 을 거친 읽기에서 `LINK` 는 선택입니다.
- **응답 풀어 보기** : `failed` 의 `%op` 아래에는 `%create`, `%update`, `%delete`, `%assoc`, `%action` 이 있어 어떤 작업이 실패했는지 알 수 있습니다. 실패 원인은 `%fail-cause` 에 있습니다. child entity 의 실패는 `failed` 의 자식 쪽 테이블에 따로 담깁니다.
- unmanaged 이므로 behavior implementation(동작 구현)은 모두 behavior pool 의 로컬 클래스(CCIMP include)에 있습니다. 자세한 설명은 SAP 예제 코드의 주석에 적혀 있습니다.

## 관련 항목

- [[abensheet_rap_ext_num_m_abexa]]
- [[abapmodify_entity_entities]]
- [[abapread_entity_entities]]
- [[abapread_entities_operations]]
- [[abaphandler_meth_features]]
- [[abaphandler_meth_global_features]]
- [[abenbdl_authorization]]
- [[abenbdl_impl_type]]
- [[abapeml_examples_abexas]]
