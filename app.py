import streamlit as st
import pandas as pd
import io
from core.bom_generator import BomGenerator

def initialize_data():
    """初始化或加载数据到会话状态中"""
    if 'df_明细表' not in st.session_state:
        # 首次加载时，创建一个包含正确列名的空DataFrame
        columns = ['款式编码', '品类', '波段', '开发颜色']  # 可根据需要添加更多列
        st.session_state.df_明细表 = pd.DataFrame(columns=columns)

# 初始化数据
initialize_data()

st.title("BOM协同工作流平台 (PoC)")
st.markdown("### 在线填写新品研发明细并实时生成BOM视图")

# ------------ 1. 在线编辑新品研发明细 ------------
st.header("1. 在线编辑新品研发明细")
st.info("您可以在下表中直接添加、修改或删除行，就像使用Excel一样。")

# 从 session_state 读取当前数据
current_df = st.session_state.df_明细表

# 将当前数据传递给 data_editor，并获取编辑后的结果
edited_df = st.data_editor(
    current_df,
    num_rows="dynamic"
)

# 无论用户是否编辑，都用 data_editor 的当前输出来更新 session_state
st.session_state.df_明细表 = edited_df


# ------------ 2. 选择款式并实时预览BOM ------------
st.header("2. 选择款式并实时预览BOM")

# 从刚刚更新过的 session_state 中获取最新的款式编码列表
valid_codes = st.session_state.df_明细表['款式编码'].dropna().unique().tolist()
if not valid_codes:
    st.warning("请在上方表格中至少添加一个包含'款式编码'的有效行。")
else:
    selected_code = st.selectbox("请选择一个款式编码进行预览:", options=valid_codes)
    
    if st.button(f"🚀 生成 '{selected_code}' 的BOM预览"):
        try:
            # 创建内存中的Excel数据 (适配BomGenerator的表头格式要求)
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                # BomGenerator期望复杂表头：
                # 第0行：标题行（被header=1跳过）
                # 第1行：列名行（被读取为header）
                # 第2行：列名行（被BomGenerator作为新的列名）
                # 第3行及以后：实际数据
                
                df = st.session_state.df_明细表
                title_row = [''] * len(df.columns)      # 空的标题行（第0行）
                header_row = df.columns.tolist()        # 表头行（第1行）
                column_names_row = df.columns.tolist()  # 列名行（第2行，会被BomGenerator用作列名）
                
                # 构建完整的数据结构
                excel_data_list = [title_row, header_row, column_names_row] + df.values.tolist()
                
                adapted_df = pd.DataFrame(excel_data_list)
                adapted_df.to_excel(writer, sheet_name='明细表', index=False, header=False)
            
            output.seek(0)
            excel_data = output.getvalue()
            
            # 实例化BomGenerator
            generator = BomGenerator(io.BytesIO(excel_data))
            
            # 调用核心方法生成BOM
            bom_buffer = generator.generate_bom_file_to_buffer(selected_code)
            
            # 展示BOM预览
            st.success(f"'{selected_code}' 的BOM表已成功生成！")
            st.download_button(
                label="📥 下载生成的BOM表 (.xlsx)",
                data=bom_buffer,
                file_name=f"{selected_code}.xlsx",
                mime="application/vnd.ms-excel"
            )
            
        except Exception as e:
            st.error(f"生成BOM时发生错误：{str(e)}")
            st.info("请确保数据格式正确，特别是款式编码、品类、波段和开发颜色字段。")
